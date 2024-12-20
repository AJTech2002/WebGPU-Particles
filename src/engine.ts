import InfinityTest from "./infinity_test";
import Material from "./material";
import { Renderer } from "./renderer/renderer";


export default class Engine {

  private canvas: HTMLCanvasElement;
  private renderer: Renderer;

  // TODO:
  // This will be more generalized and will take in a JSON Scene File
  private scene: InfinityTest;

  private materials: Material[] = [];


  // Time Management
  private lastTime: number = performance.now();
  private deltaTime: number = 0;
  private time: number = 0; 

  constructor(canvas : HTMLCanvasElement) {
    console.log("Engine created v1.0.0");
    this.canvas = canvas;
    
    this.renderer = new Renderer(canvas);
    this.scene = new InfinityTest(this);

    this.init();

    requestAnimationFrame(() => this.renderLoop);

  }

  private init() {
    this.renderer.init();
  }

  private renderLoop() {
    const time = performance.now();
    const deltaTime = time - this.lastTime;
    this.lastTime = time;
    this.deltaTime = deltaTime;
    this.time += deltaTime;
    
    this.scene.render(deltaTime);
    this.renderer.render(deltaTime, this.materials);

    requestAnimationFrame(() => this.renderLoop);
  }

}