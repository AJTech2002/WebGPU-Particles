import { GameContext } from "src/interface/interface";

export default class CodeRunner {
  public run (code: string, context: GameContext) : any {

    const codeContext : any = {
      game: context
    };
    
    const params = Object.keys(codeContext);
    const values = Object.values(codeContext);

    const wrappedCode = `
    
    (async () => {
      ${code}
    })().catch(console.error);
    `;

    const asyncFunction = new Function(...params, wrappedCode);
    const val = asyncFunction(...values);

    return val;
  }

}
