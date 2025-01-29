import Engine, { createEngine } from "@engine/engine";
import CodeRunner from "./code_runner/code_runner";
import PlayerInput from "@game/player/player_input";
import BoidScene from "@game/boid_scene";
import { GameContext } from "@game/player/interface/game_interface";
import { ReactCodeMirrorRef } from "@uiw/react-codemirror";
import { SquadDef, Squad } from "@game/squad/squad";
import { saveFile } from "@/tsUtils";
import { GameDataBridge } from "./interface/bridge";
import { TestEnemyScene } from "@game/test_enemy_scene";

export interface SessionContext {
  game: GameContext;

  // Global Context
  tick: () => Promise<void>;
  seconds: (seconds: number) => Promise<void>;
  until: (condition: () => boolean) => Promise<void>;
}

/*TODO: UI Hooks for Session Manager*/
export class SessionManager {
  private codeRunner = new CodeRunner();
  private bridge: GameDataBridge | undefined;
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
        game: this.gameContext as GameContext,
        tick: this.scene.tick.bind(this.scene),
        seconds: this.scene.seconds.bind(this.scene),
        until: this.scene.until.bind(this.scene)
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
      new TestEnemyScene(),
      stats
    );

    this.bridge = new GameDataBridge(this.scene);

    this.gameContext = new GameContext(
      this.bridge
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public runCode (transpiledCode: string, onEnd?: (err : boolean) => void, customContext?: any) {
    if (this.engine !== undefined) {
      this.codeRunner.callableFn(transpiledCode, {
        ...this.context,
        ...customContext
      }, () => {
      }, () => {
        if (onEnd) {
          onEnd(false);
        }
      }, (err) => {
        console.error(err);
        if (onEnd) {
          onEnd(true);
        }
      })();
      
    }
  }

  public async beginSquad (squad: SquadDef) {
    if (this.engine !== undefined && this.scene !== undefined && this.bridge !== undefined) {
      const squadClass = new Squad([]);
      for (const unitType of squad.unitTypes) {
        for (let i = 0; i < unitType.count; i++) {
          const unit = this.scene.createUnit(
            0, 
            unitType.type
          ); // Get BoidInterface 

          if (unit) {
            squadClass.addUnit(this.bridge.getBoidInterface(
              unit.id
            )); // Add to the Squad
          }
        }
      }

      await this.scene.tick();

      const squadContext = {
        squad: squadClass,
        squadDropPosition: [this.scene.inputSystem.mouseToWorld(0).x, this.scene.inputSystem.mouseToWorld(0).y, 0],
      }

      const run = (transpiledCode : string) => {
        this.runCode(transpiledCode, (err : boolean) => {
          if (err) {
            console.warn("Error running code");
            squadClass.units.forEach((unit) => {
              unit.kill();
            });
          }

        }, squadContext);
      };

      try {

        let runCode = squad.code;

        if (squad.preCode) {
          runCode = squad.code.substring(squad.preCode.length, squad.code.length);
        }

        if (runCode.trim() !== "") {
          
          runCode = 
          `
          await tick();
          ` 
          + runCode;
          
          const code = saveFile(runCode);
          
          if (code) {
            squad.transpiledCode = code;
            run(squad.transpiledCode);
          }
        }
        
      }
      catch (e) {
        console.error("Error running code", e);
        squadClass.units.forEach((unit) => {
          unit.kill();
        });
      }


    }
  }

  public dispose() {
    this.engine?.dispose();
  }

}

const sessionManager = new SessionManager();
export default sessionManager;