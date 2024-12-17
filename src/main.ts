import { Renderer } from "./core/engine/renderer";
import update from "./test_code";

const canvas: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById("gfx-main");
let lastTime = 0;

const renderLoop = () => {
  const time = performance.now();
  const deltaTime = time - lastTime;
  lastTime = time;
  update(renderer.scene, deltaTime);
};

const renderer = new Renderer(canvas, (dt) => {});

renderer.Initialize();

setTimeout(() => {
  renderer.onRender = renderLoop;
  console.log("Starting render loop");
}, 1000);


