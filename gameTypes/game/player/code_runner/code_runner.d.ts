export default class CodeRunner {
    callableFn(code: string, context: any, onBegin: () => void, onEnd: () => void, onError: (err: any) => void): (() => void);
    private wrapCode;
    run(code: string, context: any): Promise<void>;
}
