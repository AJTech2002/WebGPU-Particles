import BoidScene from "../boid_scene";
import { GameContext } from "./interface/game_interface";
import { GameDataBridge } from "./interface/bridge";
import { Vector3 } from "../../engine/math/src";
import { BoidInterface } from "./interface/boid_interface";
export declare class GlobalStorage {
    private storage;
    get(key: string): unknown;
    set(key: string, value: unknown): void;
}
export interface SessionContext {
    game: GameContext;
    globals: GlobalStorage;
    mousePosition: Vector3;
    selection: BoidInterface[];
    tick: () => Promise<void>;
    seconds: (seconds: number) => Promise<void>;
    until: (condition: () => boolean) => Promise<void>;
}
export interface TerminalProperties {
    mousePosition: [number, number];
    loop: boolean;
}
export declare class SessionManager {
    bridge: GameDataBridge | undefined;
    private input;
    private engine;
    private gameContext;
    private codeMirror;
    private globalStorage;
    private selectionManager;
    constructor();
    get scene(): BoidScene;
    init(canvas: HTMLCanvasElement, stats?: Stats): Promise<void>;
    codeEditorHasFocus(): boolean;
    runCode(codeTitle: string, transpiledCode: string, terminalProps?: TerminalProperties): void;
    openTerminal(position?: [number, number]): void;
    closeTerminal(): void;
    dispose(): void;
}
declare const sessionManager: SessionManager;
export default sessionManager;
