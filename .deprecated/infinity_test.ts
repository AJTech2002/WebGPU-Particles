import { vec3 } from "gl-matrix";
import ParticleScene from "./test_scene";

export default class InfinityTest extends ParticleScene {
  override async setupParticles() {
    super.setupParticles();

    // // add 50 particles at (0,0)
    // setTimeout(() => {
    //   for (let i = 0; i < 50; i++) {
    //     this.particleMesh.addGuy(vec3.create());
    //   }
    // }, 1000);

  }
}