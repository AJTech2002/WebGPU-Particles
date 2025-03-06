/* eslint-disable no-with */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
// let __EVAL = (s) => eval(`void (__EVAL = ${__EVAL.toString()}); ${s}`);
// let __EVAL = s => eval(s);

import { Vector2, Vector3 } from "@engine/math/src";
import { BoidInterface } from "../interface/boid_interface";

// Have to do this to circumvent strict mode

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
  private wrapCode(code: string): string {
    const wrappedCode = `

        function line (num) {
          if (!context.running) {
            throw new Error("Execution stopped");
          }


        }

        (async () => {
          with  (context) {
            context.begin();
            with (context.scope) {
              while (context.running) {
                await tick();
                if (!context.paused) {
                  ${code}
                }
                if (!context.loop) {
                  break;
                }
              }
            }
            context.end();
          }
        })().catch((e) => {
          // console.error(e);
          context.on_error(e);
        })
      `;

    return wrappedCode;
  }


  private types = {
    Vector3,
    BoidInterface,
    Vector2,
  };

  public run<T>(code: string, context: T, loop: boolean): {
    promise: Promise<void>,
    codeContext: CodeContext<T> | undefined
  } {

    let codeContext: CodeContext<T> | undefined;
    const promise = new Promise<void>((resolve, reject) => {

      const begin = () => {
        //
      };

      const end = () => {
        resolve();
      }

      const on_error = (err: any) => {
        reject(err);
      }

      const wrappedCode = this.wrapCode(code);
      codeContext = {
        scope: context,
        running: true,
        paused: false,
        begin,
        end,
        on_error,
        code,
        loop,
        // types

      }

      // add types
      for (const type in this.types) {
        codeContext[type] = this.types[type];
      }

      console.log(codeContext);


      const asyncFunction = new Function("context", wrappedCode);

      // const val = asyncFunction(...values);
      asyncFunction(codeContext);
    });

    return {
      promise,
      codeContext
    };
  }
}

