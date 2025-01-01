import { StandardDiffuseMaterial } from "@engine/renderer/material";
import Scene from "@engine/scene";

import MatrixShasder from "./shaders/matrix.wgsl";
import InstancedShader from "./shaders/shaders.wgsl";

export default class BoidMaterial extends StandardDiffuseMaterial {

  private buffer: GPUBuffer;

  constructor(scene: Scene, objectBuffer: GPUBuffer, url?: string) {
    super(scene, url, MatrixShasder + InstancedShader);
    this.buffer = objectBuffer;
    
  }

  setupUniforms(): void {
    super.setupUniforms();
    this.setUniformEntry("objects", {
      binding: 3,
      resource: {
        buffer: this.buffer
      }
    })
  }

}
