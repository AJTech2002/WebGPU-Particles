export declare const env: import("@typescript/vfs").VirtualTypeScriptEnvironment;
export declare const typescriptCompletionSource: (context: any, preCode?: string) => Promise<{
    from: number;
    options: {
        label: string;
        type: string;
        info: any;
    }[];
}>;
export declare const transpile: () => string;
export declare const saveFile: (code: string) => string | null;
