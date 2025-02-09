export declare const env: import("@typescript/vfs").VirtualTypeScriptEnvironment;
export declare const typescriptCompletionSource: (preCode: string, context: any) => Promise<{
    from: number;
    options: {
        label: string;
        type: string;
        info: null;
    }[];
} | null>;
export declare const transpile: () => string | null;
export declare const saveFile: (code: string) => string | null;
