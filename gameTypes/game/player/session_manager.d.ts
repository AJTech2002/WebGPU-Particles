import BoidScene from "../boid_scene";
import { GameContext } from "./interface/game_interface";
export declare class GlobalStorage {
    private storage;
    get(key: string): unknown;
    set(key: string, value: unknown): void;
}
export interface SessionContext {
    game: GameContext;
    globals: GlobalStorage;
    tick: () => Promise<void>;
    seconds: (seconds: number) => Promise<void>;
    until: (condition: () => boolean) => Promise<void>;
}
export interface TerminalProperties {
    mousePosition: [number, number];
    loop: boolean;
}
export declare class SessionManager {
    private bridge;
    private input;
    private engine;
    private gameContext;
    private codeMirror;
    private sessionContext;
    private globalStorage;
    constructor();
    get scene(): BoidScene;
    get context(): SessionContext;
    init(canvas: HTMLCanvasElement, stats?: Stats): Promise<void>;
    codeEditorHasFocus(): boolean;
    runCode(codeTitle: string, transpiledCode: string, terminalProps?: TerminalProperties): void;
    openTerminal(position: [number, number]): void;
    closeTerminal(): void;
    dispose(): void;
}
declare const sessionManager: SessionManager;
export default sessionManager;
