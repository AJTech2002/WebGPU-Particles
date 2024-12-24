import { StandardDiffuseMaterial } from "@engine/renderer/material";
import Scene from "@engine/scene";

import InstancedShader from "./shaders/shaders.wgsl";

export default class BoidMaterial extends StandardDiffuseMaterial {

  private buffer: GPUBuffer;

  constructor(scene: Scene, objectBuffer: GPUBuffer, url?: string) {
    super(scene, url, InstancedShader);
    this.buffer = objectBuffer;
    
  }

  setupUniforms(): void {
    super.setupUniforms();
    console.log("Setting up uniforms for boid material");
    this.setUniformEntry("objects", {
      binding: 3,
      resource: {
        buffer: this.buffer
      }
    })
  }

}