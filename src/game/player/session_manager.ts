import Engine, { createEngine } from "@engine/engine";
import CodeRunner from "./code_runner/code_runner";
import PlayerInput from "@game/player/player_input";
import BoidScene from "@game/boid_scene";
import { GameContext } from "@game/player/interface/game_interface";
import { SquadDef, Squad } from "@game/squad/squad";
import { saveFile } from "@/tsUtils";
import { GameDataBridge } from "./interface/bridge";
import { BaseLevelScene } from "@game/test_enemy_scene";
import { GlobalTerminalContext } from "./contexts/global_terminal_context";
import { Vector3 } from "@engine/math/src";
import { BasicLevel } from "@game/basic_level";

export interface SessionContext {
  game: GameContext;

  // Global Context
  tick: () => Promise<void>;
  seconds: (seconds: number) => Promise<void>;
  until: (condition: () => boolean) => Promise<void>;
}

export interface TerminalProperties {
  mousePosition: [number, number];
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
  private globalContext: GlobalTerminalContext | undefined;

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
        until: this.scene.until.bind(this.scene),
      };

      console.log("Session Context", this.sessionContext);
    }

    return this.sessionContext;
  }

  //#endregion

  public async init (
    canvas: HTMLCanvasElement,
    stats?: Stats,
  ) {
    
    this.engine = await createEngine(
      canvas,
      new BasicLevel({
        startingUnits: 10
      }),
      stats
    );

    this.bridge = new GameDataBridge(this.scene);

    this.gameContext = new GameContext(
      this.bridge
    );

    this.globalContext = new GlobalTerminalContext(
      this.bridge
    );

    this.input = new PlayerInput(this);
  }


  public codeEditorHasFocus () {
    return this.codeMirror?.view?.hasFocus ?? false;
  }

  //TODO: returns some way to stop the code execution - and is threaded
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public runCode (transpiledCode: string, onEnd?: (err : boolean) => void, customContext?: any, terminalProps?: TerminalProperties) {
    if (this.engine !== undefined) {
      if (terminalProps?.mousePosition)
        this.gameContext.defaultMousePosition = this.bridge.screenToWorld(terminalProps.mousePosition[0], terminalProps.mousePosition[1]);
      else 
        this.gameContext.defaultMousePosition = null;

      console.log(this.gameContext.defaultMousePosition);

      this.codeRunner.run(transpiledCode, {
        ...this.context,
        ...customContext
      }).then(() => {
        if (onEnd) {
          onEnd(false);
        }
      }).catch((e) => {
        console.error(e);
        if (onEnd) {
          onEnd(true);
        }
      });
      
    }
  }

  public openTerminal (position: [number, number]) {
    const worldPos = this.bridge.screenToWorld(position[0], position[1], 0, true);
    this.scene.codeWritingTarget.transform.position.set(worldPos.x, worldPos.y, -9);
    this.scene.codeWritingTarget.visible = true;
    this.scene.timeScale = 0.2;
  }

  public closeTerminal () {
    this.scene.timeScale = 1;
    this.scene.codeWritingTarget.visible = false;
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