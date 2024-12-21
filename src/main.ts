import Engine from "@engine/engine";

const canvas: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById("gfx-main");
let lastTime = 0;

const engine: Engine = new Engine(canvas);
console.log("Engine", engine);