import Engine, { createEngine } from "@engine/engine";
import CodeRunner from "./code_runner/code_runner";
import PlayerInput from "@game/player/player_input";
import BoidScene from "@game/boid_scene";
import { GameContext } from "@player/interface/interface";
import { ReactCodeMirrorRef } from "@uiw/react-codemirror";
import { SquadDef, Squad } from "@game/squad/squad";
import { saveFile } from "@/tsUtils";

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

  public get scene () : BoidScene {
    return this.engine?.scene as BoidScene;
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

  //TODO: returns some way to stop the code execution - and is threaded
  public runCode (transpiledCode: string, customContext?: any) {
    if (this.engine !== undefined) {
      this.codeRunner.callableFn(transpiledCode, {
        ...this.context,
        ...customContext
      }, () => {
        console.log(transpiledCode);
      }, () => {
        console.log("Code Execution Complete");
      }, (err) => {
        console.error(err);
      })();
      
    }
  }

  public async beginSquad (squad: SquadDef) {
    if (this.engine !== undefined) {
      const squadClass = new Squad([]);
      for (const unitType of squad.unitTypes) {
        for (let i = 0; i < unitType.count; i++) {
          const interf = this.scene.createUnitAtMouse(); // Get BoidInterface 
          
          if (interf) {
            interf.setUnitType(unitType.type); // Set the Type
            squadClass.addUnit(interf); // Add to the Squad
          }
        }
      }

      await this.scene.tick();

      const squadContext = {
        squad: squadClass
      }

      if (squad.transpiledCode) {
        this.runCode(squad.transpiledCode, squadContext);
      }
      else {
        try {
          const code = saveFile(squad.code);
          if (code) {
            this.runCode(code);
          }
        }
        catch (e) {
          console.error("Error running code", e);
        }
      }
    }
  }

  public dispose() {
    this.engine?.dispose();
  }

}

const sessionManager = new SessionManager();
export default sessionManager;