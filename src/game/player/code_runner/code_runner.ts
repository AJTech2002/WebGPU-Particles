/* eslint-disable @typescript-eslint/no-explicit-any */

export default class CodeRunner {

  public callableFn (
    code: string, 
    context: any, 
    onBegin: () => void, 
    onEnd: () => void, 
    onError: (err : any) => void
  ) : (() => void) {
    
    context["begin"] = onBegin;
    context["end"] = onEnd;
    context["error"] = onError;
    

    const wrappedCode = this.wrapCode(code);

    const contextProxy = new Proxy(context, {
      has: () => true, // Allows referencing undeclared variables
      get: (target, prop) => target[prop],
      set: (target, prop, value) => {
        target[prop] = value;
        return true;
      }
    });

    context["proxy"] = contextProxy;

    const asyncFunction = new Function("context", wrappedCode);


    return () => {
      asyncFunction(context);
    };
  }

  private wrapCode (code: string) : string {
    const wrappedCode = `
        (async () => {
          context.begin();
          with (context) {
            ${code}
          }
          context.end();
        })().catch((e) => {
          context.error(e);
        })
      `;

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

      const error = (err: any) => {
        reject(err);
      }

      const wrappedCode = this.wrapCode(code);

      const codeContext = {
        ...context, 
        begin,
        end,
        error
      }

      const params = Object.keys(codeContext);
      const values = Object.values(codeContext);

      const asyncFunction = new Function(...params, wrappedCode);
      const val = asyncFunction(...values);

      return val;
    });
  }
}
