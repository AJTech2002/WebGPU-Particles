import { FunctionInfo } from "@/tsUtils";
import Player from "@game/player/session_manager";

export class UserCodeStorage {

  private fns = new Map<string, FunctionInfo>();

  public getPreCode() {
    return Array.from(this.fns.values()).map((fn) => fn.code).join("\n");
  }

  public store(fn: FunctionInfo) {
    this.fns.set(fn.name, fn);
    const localStorage = window.localStorage;
    console.log(JSON.stringify(Array.from(this.fns.entries())));
    localStorage.setItem("functions", JSON.stringify(Array.from(this.fns.entries())));
  }

  public commit() {
    const totalCode = Array.from(this.fns.values()).map((fn) => fn.code).join("\n");
    let postCode = "";
    const fns = Array.from(this.fns.values());
    if (fns.length > 0) {
      postCode = fns.map((f) => {
        return `globals.${f.name} = ${f.name};`;
      }).join("\n");
    }

    Player.runCode("", totalCode + postCode, null);
  }

  public retrieveFromLocalStorage() {
    const localStorage = window.localStorage;
    const stored = localStorage.getItem("functions");
    console.log(stored);
    if (stored) {

      // check if the stored functions are valid
      
      try {
        const fns = JSON.parse(stored) as [string, FunctionInfo][];
        fns.forEach(([name, fn]) => {
          this.fns.set(name, fn);
        });
      }
      catch (e) {
        // clear
        localStorage.removeItem("functions");
      }
    }
  }

}