import lib from "./lib.json";
import { createDefaultMapFromCDN, createSystem, createVirtualTypeScriptEnvironment } from "@typescript/vfs"
import ts from "typescript"

const fsMap = new Map();

const libs = [];
//loop through lib and add all to fsMap
for (const key in lib) {
    fsMap.set(key, (lib as any)[key]);
    libs.push(key.replace('/lib.', ''));
}

console.log(libs);

const code = 'const a = "Hello World"; a.';
fsMap.set('index.ts', code);

// Set compiler options with the appropriate library
const compilerOpts = {
    target: ts.ScriptTarget.ES2015,
    lib: libs,
};


const system = createSystem(fsMap);
export const env = createVirtualTypeScriptEnvironment(
    system,
    ['index.ts'],
    ts,
    compilerOpts
);

export const typescriptCompletionSource = async (context: any) => {
    const code = context.state.doc.toString();
    let cursorPos = context.pos;

    // Update the virtual file system with the current content

    const preCode = `import {Game} from "/src/interface/abstraction/game"; 
        var game: Game = new Game();
    `;
    const totalCode = preCode + code;

    env.updateFile("index.ts", totalCode);

    cursorPos += preCode.length;


    // Get completions from the TypeScript language service
    const completions = env.languageService.getCompletionsAtPosition("index.ts", cursorPos, {
        allowIncompleteCompletions: true,
        includeExternalModuleExports: true,
        includeInsertTextCompletions: true,
    });

    // If no completions are available, return null
    if (!completions || !completions.entries) return null;

    // Map filtered completions to CodeMirror Completion objects

    // Get the last word before the cursor position
    const getLastWord = () => {
        const words = totalCode.slice(0, cursorPos).split(/[\s.]+/);
        return words.pop() || "";
    };

    const lastWord = getLastWord();
    // console.log(lastWord, cursorPos);
    const filteredCompletions = completions.entries
        .filter((entry) => entry.name.toLowerCase().includes(lastWord.toLowerCase()))
        .map((entry) => ({
            label: entry.name,
            type: 'variable',
            info: null,
        }));

    return {
        from: context.pos - lastWord.length,
        options: filteredCompletions,
    };
};

export const transpile = () => {
    const output = env.languageService.getEmitOutput('index.ts');
    const jsOutput = output.outputFiles.find((file) => file.name.endsWith(".js"));

    return jsOutput ? jsOutput.text : null;
}


export const saveFile = (code: string) => {
    // Update the virtual file system with the current content
    env.updateFile("index.ts", code);

    const transpiledCode = transpile();

    // Store in local storage
    localStorage.setItem('transpiled', transpiledCode);
    // Store the non-transpiled code in local storage
    localStorage.setItem('code', code);
}
