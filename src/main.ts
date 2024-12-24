import Engine, { createEngine } from "@engine/engine";
import TestScene from "./game/test_scene";
import BoidScene from "./game/boid_scene";
import tgpu, { TgpuRoot } from "typegpu";

const canvas: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById("gfx-main");
let lastTime = 0;

const engine : Engine = await createEngine(canvas, new BoidScene());

console.log("Engine", engine);