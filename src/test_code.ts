import { vec3 } from "gl-matrix";
import Scene from "./core/engine/scene";
import ParticleScene from "./test_scene";

let currentTime = 0.0;
let mouseX = 0;
let mouseY = 0;

window.addEventListener("mousemove", (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

let currentStart : ((scene: ParticleScene) => void) | undefined = start;

function start(scene: ParticleScene) {
  setTimeout(() => {
    for (let i = 0; i < 1000; i++) {
      scene.getParticles().addGuy(vec3.fromValues(scene.mousePosWorld?.[0]!, scene.mousePosWorld?.[1]!, -10),1);
    }
  }, 100);

  setInterval(() => {
    console.log("Guy 100 Position", scene.getParticles().getPosition(100))
  }, 100);
}

export default function update (scene: ParticleScene, deltaTime: number) {
  currentTime += deltaTime;
  
  if (currentStart !== undefined) {
    start(scene);
    currentStart = undefined;
  }
  else {
   // Use current mouseX, mouseY
   scene.mousePosWorld = scene.mouseToWorld({ clientX: mouseX, clientY: mouseY }, -10);
  }    


}