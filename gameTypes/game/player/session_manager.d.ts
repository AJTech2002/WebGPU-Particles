import CodeRunner from "./code_runner/code_runner";
import BoidScene from "../boid_scene";
import { GameContext } from "./interface/game_interface";
import { ReactCodeMirrorRef } from "@uiw/react-codemirror";
import { SquadDef } from "../squad/squad";
export interface SessionContext {
    game: GameContext;
    tick: () => Promise<void>;
    seconds: (seconds: number) => Promise<void>;
    until: (condition: () => boolean) => Promise<void>;
}
export declare class SessionManager {
    private codeRunner;
    private bridge;
    private input;
    private engine;
    private gameContext;
    private codeMirror;
    private sessionContext;
    private globalContext;
    constructor();
    get runner(): CodeRunner;
    get scene(): BoidScene;
    get context(): SessionContext;
    init(canvas: HTMLCanvasElement, codeMirror: ReactCodeMirrorRef, stats?: Stats): Promise<void>;
    updateEditorRef(codeMirror?: ReactCodeMirrorRef): void;
    codeEditorHasFocus(): boolean;
    runCode(transpiledCode: string, onEnd?: (err: boolean) => void, customContext?: any): void;
    beginSquad(squad: SquadDef): Promise<void>;
    dispose(): void;
}
declare const sessionManager: SessionManager;
export default sessionManager;
