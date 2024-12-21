import Engine, { createEngine } from "@engine/engine";
import TestScene from "./game/test_scene";

const canvas: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById("gfx-main");
let lastTime = 0;


const engine : Engine = await createEngine(canvas, new TestScene());

console.log("Engine", engine);