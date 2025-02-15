export interface CodeContext<T> {
    scope: T;
    running: boolean;
    paused: boolean;
    begin: () => void;
    end: () => void;
    on_error: (err: any) => void;
    code: string;
    loop: boolean;
}
export default class CodeRunner {
    private wrapCode;
    run<T>(code: string, context: T, loop: boolean): {
        promise: Promise<void>;
        codeContext: CodeContext<T> | undefined;
    };
}
