import lib from "./lib.json";
import { createDefaultMapFromCDN, createSystem, createVirtualTypeScriptEnvironment } from "@typescript/vfs"
import ts, { CompilerOptions } from "typescript"

const fsMap = new Map();

const libs = [];
const imports = [];

export interface FunctionInfo {
  name: string;
  code: string;
}

//loop through lib and add all to fsMap
for (const key in lib) {

  fsMap.set(key, (lib as any)[key]);

  libs.push(key.replace('/lib.', ''));

  if (key.startsWith('/') && !key.startsWith('/lib.')) {
    imports.push(key);
  }
}

const code = 'const a = "Hello World"; a.';
fsMap.set('index.ts', code);

// Set compiler options with the appropriate library
const compilerOpts: CompilerOptions = {
  target: ts.ScriptTarget.ESNext,
  lib: libs,
  experimentalDecorators: true,
  allowJs: true,
  noImplicitAny: false,
  emitDecoratorMetadata: true,
  // emitDecoratorMetadata: true,
};


const system = createSystem(fsMap);
export const typescriptEnv = createVirtualTypeScriptEnvironment(
  system,
  ['index.ts'],
  ts,
  compilerOpts
);

const recurseTree = (node: ts.Node, level: number = 0, arr: FunctionInfo[]) => {
  if (node.kind === ts.SyntaxKind.FunctionDeclaration) {
    // console.log(node.getText());
    // name
    // console.log((node as ts.FunctionTypeNode).name?.getText());
    arr.push({
      name: (node as ts.FunctionTypeNode).name?.getText() ?? "",
      code: node.getText()
    });
  }

  ts.forEachChild(node, (child) => {
    recurseTree(child, level + 1, arr);
  });
}

export const findFunctions = (code: string) => {
  const _file = ts.createSourceFile(
    'temp.ts',
    code,
    ts.ScriptTarget.Latest,
    true
  );
  const output: FunctionInfo[] = [];
  if (_file) {
    recurseTree(_file, 0, output);
  }
  return output;
}

export const typescriptCompletionSource = async (context: any, preCode?: string) => {
  const code = (preCode ?? "") + context.state.doc.toString();

  let cursorPos = context.pos;

  //TODO: This needs to be automated
  const totalCode = code;
  typescriptEnv.updateFile("index.ts", totalCode);
  cursorPos += preCode?.length;

  // Get completions from the TypeScript language service
  const completions = typescriptEnv.languageService.getCompletionsAtPosition("index.ts", cursorPos, {
    allowIncompleteCompletions: true,
    includeExternalModuleExports: true,
    includeInsertTextCompletions: true,
  });

  // find the functions using ast


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
  const output = typescriptEnv.languageService.getEmitOutput('index.ts');
  const jsOutput = output.outputFiles.find((file) => file.name.endsWith(".js"));

  return jsOutput ? jsOutput.text : null;
}


export const saveFile = (code: string): string | null => {
  // Update the virtual file system with the current content
  typescriptEnv.updateFile("index.ts", code);

  const transpiledCode = transpile();
  if (!transpiledCode) {
    console.error("Transpilation failed");
    return null;
  }

  // Store in local storage
  localStorage.setItem('transpiled', transpiledCode);
  // Store the non-transpiled code in local storage
  localStorage.setItem('code', code);

  return transpiledCode;
}
