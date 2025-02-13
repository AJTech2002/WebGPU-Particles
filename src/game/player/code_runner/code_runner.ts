/* eslint-disable no-with */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
// let __EVAL = (s) => eval(`void (__EVAL = ${__EVAL.toString()}); ${s}`);
// let __EVAL = s => eval(s);
let __EVAL = (s, context) => {
  const contextAssignments = Object.entries(context)
    .map(([key, value]) => `const ${key} = context["${key}"];`)
    .join("\n");

  return eval(`
    
   (async () => {
    void (__EVAL = ${__EVAL.toString()}); 
    ${contextAssignments} 
    ${s} 
    })();
    
  `);
};
async function evaluate(expr, context) {
  try {
    const a = 3;
    const result = await (__EVAL(expr, context));
  } catch (err : any) {
    console.log(expr, 'ERROR:', err)
    throw err;
  }
}

export default class CodeRunner {

  private wrapCode () : string {
    const wrappedCode = `
        (async () => {
          context.begin();

          with (context) {
            await evaluate(code, context);
          }
          context.end();
        })().catch((e) => {
          console.error(e);
          on_error(e);
        })
      `;

      console.log(wrappedCode);

    return wrappedCode;
  }

  
  

  public run (code: string, context: any) : Promise<void> {
    return new Promise((resolve, reject) => {
    
      const begin = () => {
        //
      };

      const end = () => {
        resolve();
      }

      const on_error = (err: any) => {
        reject(err);
      }

      const wrappedCode = this.wrapCode();
      const codeContext = {
        ...context, 
        begin,
        end,
        on_error,
        evaluate,
        code
      }

      const asyncFunction = new Function("context", wrappedCode);
      // const val = asyncFunction(...values);
      asyncFunction(codeContext);
    });
  }
}
