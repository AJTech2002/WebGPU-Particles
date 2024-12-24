import Engine, { createEngine } from "@engine/engine";
import BoidScene from "./game/boid_scene";

const canvas: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById("gfx-main");
let lastTime = 0;

const engine : Engine = await createEngine(canvas, new BoidScene());

console.log("Engine", engine);