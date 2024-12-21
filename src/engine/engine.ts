import Scene from "./scene";
import Material from "./renderer/material";
import { Renderer } from "./renderer/renderer";

export default class Engine {

  private canvas: HTMLCanvasElement;
  private renderer: Renderer;

  // TODO:
  // This will be more generalized and will take in a JSON Scene File
  private scene: Scene;

  private materials: Material[] = [];


  // Time Management
  private lastTime: number = performance.now();
  private deltaTime: number = 0;
  private time: number = 0; 

  constructor(canvas : HTMLCanvasElement) {
    console.log("Engine created v1.0.1");
    this.canvas = canvas;
    
    this.renderer = new Renderer(canvas);
    this.scene = new Scene(this.renderer);

    this.init();
  }

  private init() {
    this.renderer.init().then(() => {
      requestAnimationFrame((t) => this.renderLoop(t));
    })
  }

  private renderLoop(t : number) {
    const time = t;
    const deltaTime = time - this.lastTime;
    this.lastTime = time;
    this.deltaTime = deltaTime;
    this.time += deltaTime;
    
    this.scene.render(deltaTime); // 1. Update the scene

    this.renderer.updateGlobalUniforms(this.scene.activeCamera.view, this.scene.activeCamera.projection, this.time); // 2. Update the global uniforms

    this.renderer.render(deltaTime, this.materials); // 3. Render the scene

    requestAnimationFrame((t) => this.renderLoop(t));
  }

}