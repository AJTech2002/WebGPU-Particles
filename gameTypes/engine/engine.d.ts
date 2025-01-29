import Scene from "./scene";
import { Renderer } from "./renderer/renderer";
import Stats from "stats.js";
export declare let activeScene: Scene | undefined;
export default class Engine {
    private canvas;
    private _renderer;
    private _scene;
    private lastTime;
    private deltaTime;
    private time;
    constructor(canvas: HTMLCanvasElement, scene: Scene);
    get renderer(): Renderer;
    get outputCanvas(): HTMLCanvasElement;
    get scene(): Scene;
    private init;
    private renderLoop;
    dispose(): void;
}
export declare let device: GPUDevice;
export declare let renderTargetFormat: GPUTextureFormat;
export declare let adapter: GPUAdapter;
export declare function createEngine(canvas: HTMLCanvasElement, scene: Scene, _stats: Stats | undefined): Promise<Engine>;
