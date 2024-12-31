import Scene from "./scene";
import Material from "./renderer/material";
import { Renderer } from "./renderer/renderer";

export default class Engine {

  private canvas: HTMLCanvasElement;
  
  private _renderer: Renderer;
  private _scene: Scene;

  // Time Management
  private lastTime: number = performance.now();
  private deltaTime: number = 0;
  private time: number = 0; 

  constructor(canvas : HTMLCanvasElement, scene: Scene) {

    if (!device || !adapter) {
      console.error("WebGPU not initialized. Please call createEngine() instead of using the constructor directly.");
    }

    console.log("Engine created v1.0.1");
    this.canvas = canvas;
    
    this._renderer = new Renderer(canvas);
 
    this._scene = scene;
    this.init();
       
  }

  public get renderer() : Renderer {
    return this._renderer;
  }

  public get outputCanvas() : HTMLCanvasElement {
    return this.canvas;
  }

  public get scene() : Scene {
    return this._scene;
  }

  private init() {
    this._renderer.start().then(() => {
      this._scene.awake(this);
      this._scene.start();  
      requestAnimationFrame((t) => this.renderLoop(t));
    });
  }

  private renderLoop(t : number) {
    const time = t;
    const deltaTime = time - this.lastTime;
    this.lastTime = time;
    this.deltaTime = deltaTime;
    this.time += deltaTime;

    this._scene.render(deltaTime); // 1. Update the scene

    this._renderer.updateGlobalUniforms(this._scene.activeCamera!.view, this._scene.activeCamera!.projection, this.time); // 2. Update the global uniforms

    this._renderer.render(deltaTime, this._scene.materials); // 3. Render the scene

    requestAnimationFrame((t) => this.renderLoop(t));
  }

  public dispose() {
    this._renderer.dispose();
    this._scene.dispose();
  }

}

export let device: GPUDevice;
export let renderTargetFormat: GPUTextureFormat = "bgra8unorm";
export let adapter: GPUAdapter;

export async function createEngine(canvas: HTMLCanvasElement, scene: Scene) : Promise<Engine> {
  adapter = <GPUAdapter>await navigator.gpu?.requestAdapter();
  device = <GPUDevice>await adapter?.requestDevice();
  return new Engine(canvas, scene);
}
