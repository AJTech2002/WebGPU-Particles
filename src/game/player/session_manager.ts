import Engine, { createEngine } from "@engine/engine";
import PlayerInput from "@game/player/player_input";
import BoidScene from "@game/boid_scene";
import { GameContext } from "@game/player/interface/game_interface";
import { GameDataBridge } from "./interface/bridge";
import { Vector3 } from "@engine/math/src";
import { BasicLevel } from "@game/basic_level";
import codeExecutionManager from "./code_runner/code_exec_manager";
import { ReactCodeMirrorRef } from "@uiw/react-codemirror";
import { BoidInterface } from "./interface/boid_interface";
import { UserCodeStorage } from "@game/ui/game/UserCodeStorage";

// Proxy class that supports dot notation for accessing & creating properties
export class GlobalStorage {
  private storage: Record<string, unknown> = {};

  public get(key: string) {
    return this.storage[key];
  }

  public set(key: string, value: unknown) {
    this.storage[key] = value;
  }
}

export interface SessionContext {
  game: GameContext;
  globals: GlobalStorage;
  mousePosition: Vector3;
  tick: () => Promise<void>;
  seconds: (seconds: number) => Promise<void>;
  until: (condition: () => boolean) => Promise<void>;
}

export interface TerminalProperties {
  mousePosition: [number, number];
  loop: boolean;
}


/*TODO: UI Hooks for Session Manager*/
export class SessionManager {
  public bridge: GameDataBridge | undefined;
  private input: PlayerInput | undefined;
  private engine: Engine | undefined;
  private gameContext: GameContext | undefined;
  private codeMirror: ReactCodeMirrorRef | undefined;
  private globalStorage: GlobalStorage | undefined = new GlobalStorage();

  // Stores User Code Context (Functions)
  public userCodeStorage: UserCodeStorage | undefined = new UserCodeStorage();


  constructor() { }

  //#region Getters
  public get scene(): BoidScene {
    return this.engine?.scene as BoidScene;
  }

  //#endregion

  public async init(
    canvas: HTMLCanvasElement,
    stats?: Stats,
  ) {

    this.engine = await createEngine(
      canvas,
      new BasicLevel({
        squads: [
          {
            type: "Soldier",
            squadSize: 5
          }
        ],
        enemySettings: {
          waves: [
            {
              groups: [
                {
                  numUnits: 3,
                  minDelay: 0,
                  maxDelay: 0
                },
                {
                  numUnits: 2,
                  minDelay: 10,
                  maxDelay: 15
                },
                {
                  numUnits: 5,
                  minDelay: 5,
                  maxDelay: 10
                },
                {
                  numUnits: 4,
                  minDelay: 0,
                  maxDelay: 0
                },
                {
                  numUnits: 6,
                  minDelay: 5,
                  maxDelay: 15
                },
                {
                  numUnits: 10,
                  minDelay: 7,
                  maxDelay: 12
                },
                {
                  numUnits: 2,
                  boss: true,
                  minDelay: 0,
                  maxDelay: 0
                }
              ]
            }
          ]
        }
      }),
      stats
    );

    this.bridge = new GameDataBridge(this.scene);

    this.gameContext = new GameContext(
      this.bridge
    );



    this.input = new PlayerInput(this);

    this.userCodeStorage.retrieveFromLocalStorage();
    this.userCodeStorage.commit(); // Run the code
  }


  public codeEditorHasFocus() {
    return this.codeMirror?.view?.hasFocus ?? false;
  }

  //TODO: returns some way to stop the code execution - and is threaded
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public runCode(codeTitle: string, transpiledCode: string, terminalProps?: TerminalProperties) {
    if (this.engine !== undefined) {
      if (terminalProps?.mousePosition)
        this.gameContext.defaultMousePosition = this.bridge.screenToWorld(terminalProps.mousePosition[0], terminalProps.mousePosition[1]);
      else
        this.gameContext.defaultMousePosition = null;

      console.log(this.gameContext.defaultMousePosition);

      const newContext: SessionContext = {
        game: this.gameContext as GameContext,
        tick: this.scene.tick.bind(this.scene),
        seconds: this.scene.seconds.bind(this.scene),
        until: this.scene.until.bind(this.scene),
        globals: this.globalStorage as GlobalStorage,
        mousePosition: this.gameContext.mousePosition,
      };

      codeExecutionManager.runCode(codeTitle, transpiledCode, newContext, terminalProps?.loop ?? false);
    }
  }

  public openTerminal(position?: [number, number]) {

    if (this.scene === undefined) return;

    this.scene.timeScale = 0.02;


    if (position === undefined) {
      this.scene.codeWritingTarget.visible = false;
      return;
    }

    const worldPos = this.bridge.screenToWorld(position[0], position[1], 0, true);
    this.scene.codeWritingTarget.transform.position.set(worldPos.x, worldPos.y, -9);
    this.scene.codeWritingTarget.visible = true;
  }

  public closeTerminal() {
    if (this.scene === undefined) return;

    this.scene.timeScale = 1;
    this.scene.codeWritingTarget.visible = false;
  }

  public dispose() {
    this.engine?.dispose();
  }

}

const sessionManager = new SessionManager();
export default sessionManager;
