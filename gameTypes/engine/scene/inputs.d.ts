import { Vector2, Vector3 } from "../math/src/index.js";
import Scene from "../scene";
export default class Input {
    inputMappings: Map<string, boolean>;
    scene: Scene | null;
    mousePosition: Vector2;
    private leftMouse;
    private rightMouse;
    private middleMouse;
    constructor(scene: Scene);
    dispose(): void;
    mapMouse(inputMouseButton: number): number;
    get blockedByUI(): boolean;
    setup(): void;
    getMouseButton(mouseButton: number): boolean;
    getAdjustedMousePosition(): Vector2;
    getRawHorizontal(): number;
    getRawVertical(): number;
    mouseToWorld: (z: number, absolute?: boolean) => Vector3;
    screenToWorld: (_x: number, _y: number, z: number, absolute: boolean) => Vector3;
    worldToScreen: (worldPos: Vector3, absolute: boolean) => Vector2;
    keyIsPressed(key: string): boolean;
}
