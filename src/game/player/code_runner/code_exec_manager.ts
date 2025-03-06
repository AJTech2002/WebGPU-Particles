import React, { useCallback, useEffect } from "react";
import { EventEmitter } from "@/utils/emitter";
import CodeRunner, { CodeContext } from "./code_runner";
import { SessionContext } from "../session_manager";
import { saveFile } from "@/tsUtils";
import { makeSafe } from "@/tsSafety";

export class RunningHandler {

  public code: string = "";
  public id: string = "";
  public context: CodeContext<SessionContext>;
  public promise: Promise<void>;
  public title: string;
  public completed: boolean = false;


  constructor(title: string, code: string, id: string, promise: Promise<void>, context: CodeContext<SessionContext>) {
    this.title = title;
    this.code = code;
    this.id = id;
    this.context = context;
    this.promise = promise;
    this.context = context;

    this.promise.then(() => {
      this.onCompletion();
    }).catch((e) => {
      this.onError(e);
    });

  }

  public cancelExecution() {
    this.context.running = false;
    console.log("Execution Cancelled");
    this.completed = true;
  }

  public onError(e: Error) {
    // emit error
    console.error(e);
    this.completed = true;

  }

  public pauseCode() {
    this.context.paused = true;
  }

  public resumeCode() {
    this.context.paused = false;
  }

  public onCompletion() {
    // emit completion
    console.log("Code Execution Completed");
    this.completed = true;
  }

}

// create vents
export type CodeExecutionEvents = {
  'started_new': void,
  'completed': void,
  'error': { handler: RunningHandler, error: Error },
};

// extend an emitter
export class CodeExecutionManager extends EventEmitter<CodeExecutionEvents> {

  private runningFunctions: Map<string, RunningHandler> = new Map();
  private codeRunner = new CodeRunner();



  public getRunningFunctions(): RunningHandler[] {
    return Array.from(this.runningFunctions.values());
  }

  public cancelExecution(id: string) {
    const handler = this.runningFunctions.get(id);

    if (handler) {
      handler.cancelExecution();
    }
  }


  public isRunning(id: string) {
    return this.runningFunctions.has(id);
  }

  public async runCode(id: string, codeTitle: string, code: string, context: SessionContext, loop: boolean) {

    const globalWrapped = `
      with (context.scope.globals) {
        ${code}
      }
    `

    const safeCode = makeSafe(globalWrapped);

    //console.log("Safe Code", safeCode);

    const outputTranspiled = saveFile(safeCode);

    // create execution
    const {
      promise,
      codeContext
    } = this.codeRunner.run(outputTranspiled, context, loop);

    const runHandler = new RunningHandler(codeTitle, outputTranspiled, id, promise, codeContext);

    promise.then(() => {
      // remove
      codeExecutionManager.emit('completed', undefined);

      // time for animation
      setTimeout(() => {
        this.runningFunctions.delete(id);
        codeExecutionManager.emit('completed', undefined);
      }, 300);

    }).catch((e) => {
      // remove
      this.runningFunctions.delete(id);
      codeExecutionManager.emit('error', { handler: runHandler, error: e });
    });

    this.runningFunctions.set(id, runHandler);

    this.emit('started_new', undefined);
  }

}

// create global context that interacts with this class
const codeExecutionManager = new CodeExecutionManager();

// react context
const CodeExecutionContext = React.createContext(codeExecutionManager);
export const CodeExecutionProvider = CodeExecutionContext.Provider;

// create a custom hook that uses the context
export const useActiveRunningAsyncThreads = () => {
  const context = React.useContext(CodeExecutionContext);
  const [runningFunctions, setRunningFunctions] = React.useState<RunningHandler[]>([]);
  const [mappedRunningFunctions, setMappedRunningFunctions] = React.useState<Map<string, RunningHandler>>(new Map());

  if (!context) {
    throw new Error('useCodeExecution must be used within a CodeExecutionProvider');
  }

  const setMapped = (runningFunctions: RunningHandler[]) => {
    const newMap = new Map();
    runningFunctions.forEach((handler) => {
      newMap.set(handler.id, handler);
    });

    setMappedRunningFunctions(newMap);
  }

  const update = () => {
    setRunningFunctions([...context.getRunningFunctions()]);
    setMapped([...context.getRunningFunctions()]);
  }

  const isRunning = useCallback((id: string) => {
    return mappedRunningFunctions.has(id);
  }, [mappedRunningFunctions]);

  useEffect(() => {

    update();

    context.on('started_new', (handler) => {
      update();
    });

    codeExecutionManager.on('completed', (handler) => {
      update();
    });

    codeExecutionManager.on('error', (data) => {
      update();
    });

    return () => {

      context.off('started_new', (handler) => {
        update();
      });

      codeExecutionManager.off('completed', (handler) => {
        update();
      });

      codeExecutionManager.off('error', (data) => {
        update();
      });
    }

  }, [context]);

  return {
    runningFunctions,
    isRunning,
  };

};

export default codeExecutionManager;

