import React from "react";
import { EventEmitter } from "../../../utils/emitter";
import { CodeContext } from "./code_runner";
import { SessionContext } from "../session_manager";
export declare class RunningHandler {
    code: string;
    id: string;
    context: CodeContext<SessionContext>;
    promise: Promise<void>;
    title: string;
    completed: boolean;
    constructor(title: string, code: string, id: string, promise: Promise<void>, context: CodeContext<SessionContext>);
    cancelExecution(): void;
    onError(e: Error): void;
    pauseCode(): void;
    resumeCode(): void;
    onCompletion(): void;
}
export type CodeExecutionEvents = {
    'started_new': void;
    'completed': void;
    'error': {
        handler: RunningHandler;
        error: Error;
    };
};
export declare class CodeExecutionManager extends EventEmitter<CodeExecutionEvents> {
    private runningFunctions;
    private codeRunner;
    getRunningFunctions(): RunningHandler[];
    runCode(codeTitle: string, code: string, context: SessionContext, loop: boolean): Promise<void>;
}
declare const codeExecutionManager: CodeExecutionManager;
export declare const CodeExecutionProvider: React.Provider<CodeExecutionManager>;
export declare const useActiveRunningAsyncThreads: () => {
    runningFunctions: RunningHandler[];
};
export default codeExecutionManager;
