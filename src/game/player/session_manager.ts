import Engine, { createEngine } from "@engine/engine";
import CodeRunner from "./code_runner/code_runner";
import PlayerInput from "@game/player/player_input";
import BoidScene from "@game/boid_scene";
import { GameContext } from "@player/interface/interface";
import { ReactCodeMirrorRef } from "@uiw/react-codemirror";

export interface SessionContext {
  game: GameContext;
}

/*TODO: UI Hooks for Session Manager*/
export class SessionManager {
  private codeRunner = new CodeRunner();
  private input: PlayerInput | undefined;
  private engine : Engine | undefined;
  private gameContext: GameContext | undefined;
  private codeMirror: ReactCodeMirrorRef | undefined;

  private sessionContext: SessionContext | undefined;

  constructor() {}

  //#region Getters
  public get runner () {
    return this.codeRunner;
  }

  public get context () : SessionContext {

    if (this.sessionContext === undefined) {
      this.sessionContext = {
        game: this.gameContext as GameContext
      };
    }

    return this.sessionContext;
  }

  //#endregion

  public async init (
    canvas: HTMLCanvasElement,
    codeMirror: ReactCodeMirrorRef, 
    stats: Stats | undefined,
  ) {
    
    this.updateEditorRef(codeMirror);
    
    this.engine = await createEngine(
      canvas,
      new BoidScene(),
      stats
    );

    this.gameContext = new GameContext(
      this.engine.scene as BoidScene
    );

    this.input = new PlayerInput(this);
  }

  public updateEditorRef (codeMirror: ReactCodeMirrorRef) {
    this.codeMirror = codeMirror;
  }

  public codeEditorHasFocus () {
    return this.codeMirror?.view?.hasFocus ?? false;
  }

  

  public runCode (transpiledCode: string) {
    if (this.engine !== undefined) {
      this.codeRunner.run(transpiledCode, )
      .then(() => {
        console.log("Code executed successfully");
      })
      .catch((e) => {
        console.error("Error executing code", e);
      });
    }
  }

  public dispose() {
    this.engine?.dispose();
  }

}

const sessionManager = new SessionManager();
export default sessionManager;