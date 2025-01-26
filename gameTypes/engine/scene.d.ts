import { mat4, vec4 } from "gl-matrix";
import Engine from "./engine";
import Material from "./renderer/material";
import GameObject from "./scene/gameobject";
import CameraComponent from "./scene/core/camera_component";
import Input from "./scene/inputs";
import Component from "./scene/component";
export interface CameraData {
    view: mat4;
    projection: mat4;
    transform: mat4;
    leftRightBottomTop: vec4;
}
declare type RenderCallback = (dt: number) => void;
export default class Scene {
    protected _engine: Engine;
    protected _materials: Material[];
    protected _gameObjects: GameObject[];
    protected time: number;
    protected cameraObject: GameObject;
    protected input: Input;
    private disposed;
    constructor();
    get activeCamera(): CameraComponent | null;
    get materials(): Material[];
    get engine(): Engine;
    get renderer(): import("./renderer/renderer").Renderer;
    get inputSystem(): Input;
    registerMaterial(material: Material): void;
    addGameObject(gameObject: GameObject): void;
    removeGameObject(gameObject: GameObject): void;
    findGameObject(name: string): GameObject | null;
    findObjectsOfType<T extends Component>(type: new (...args: any[]) => T): T[];
    get gameObjects(): GameObject[];
    get sceneTime(): number;
    dT: number;
    frame: number;
    render(dT: number): void;
    private callbacks;
    createRenderCallback(callback: RenderCallback): void;
    removeRenderCallback(callback: RenderCallback): void;
    awake(engine: Engine): void;
    start(): void;
    inputEvent(type: number, key: string): void;
    mouseEvent(type: number, button: number): void;
    dispose(): void;
    runLoopForSeconds(seconds: number, callback: (dt: number) => void, endCallback?: () => void): void;
    /**
     * Wait for the next game tick
     * @returns Awaitable Promise
     * @example `await gameManager.tick();`
     */
    tick: () => Promise<void>;
    /**
     * Wait until a condition is met
     * @param condition The condition to wait for
     * @returns Awaitable Promise
     */
    until: (condition: () => boolean) => Promise<void>;
    /**
     * Wait for the next n seconds
     * @param s Number of seconds to wait
     * @returns Awaitable Promise
     * @example `await gameManager.seconds(5);`
     */
    seconds: (s: number) => Promise<void>;
}
export {};
