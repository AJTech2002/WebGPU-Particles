import React, { useEffect } from "react";
import mitt, { EventType, Emitter } from "mitt";
import { EventEmitter } from "@/utils/emitter";
import CodeRunner, { CodeContext } from "./code_runner";
import { SessionContext } from "../session_manager";
import { Session } from "inspector/promises";
import { saveFile } from "@/tsUtils";
import { Vector3 } from "@engine/math/src";
import { BoidInterface } from "../interface/boid_interface";

export class RunningHandler {

  public code: string = "";
  public id: string = "";
  public context: CodeContext<SessionContext>;
  public promise: Promise<void>;
  public title: string;
  public completed: boolean = false;


  constructor (title: string, code: string, id: string, promise: Promise<void>, context: CodeContext<SessionContext> ) {
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

  public cancelExecution () {
    this.context.running = false;
    this.completed = true;
  }

  public onError (e: Error) {
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

  public onCompletion () {
    // emit completion
    console.log("Code Execution Completed");
    this.completed = true;
  }

}

// create vents
export type CodeExecutionEvents = {
  'started_new': void,
  'completed': void,
  'error': {handler: RunningHandler, error: Error},
};

// extend an emitter
export class CodeExecutionManager extends EventEmitter<CodeExecutionEvents> {

  private runningFunctions: Map<string, RunningHandler> = new Map();
  private codeRunner = new CodeRunner();



  public getRunningFunctions () : RunningHandler[] {
    return Array.from(this.runningFunctions.values());
  }

  public async runCode (codeTitle: string, code: string, context: SessionContext, loop: boolean) {

    // create hash
    const id = Math.random().toString(36).substring(7);


    const globalWrapped = `
      with (context.scope.globals) {
        ${code}
      }
    `

    const outputTranspiled = saveFile(globalWrapped);

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
      codeExecutionManager.emit('error', {handler: runHandler, error: e});
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
  const [runningFunctions, setRunningFunctions] = React.useState<RunningHandler[]> ([]);

  if (!context) {
    throw new Error('useCodeExecution must be used within a CodeExecutionProvider');
  }

  useEffect(() => {
    
    context.on('started_new', (handler) => {
      setRunningFunctions([...context.getRunningFunctions()]);
    });

    codeExecutionManager.on('completed', (handler) => {
      setRunningFunctions([...codeExecutionManager.getRunningFunctions()]);
    });

    codeExecutionManager.on('error', (data) => {
      setRunningFunctions([...codeExecutionManager.getRunningFunctions()]);
    });

    return () => {

      context.off('started_new', (handler) => {
        setRunningFunctions([...context.getRunningFunctions()]);
      });

      codeExecutionManager.off('completed', (handler) => {
        setRunningFunctions([...codeExecutionManager.getRunningFunctions()]);
      });

      codeExecutionManager.off('error', (data) => {
        setRunningFunctions([...codeExecutionManager.getRunningFunctions()]);
      });
    }

  }, [context]);

  return {
    runningFunctions,
  };

};

export default codeExecutionManager;

