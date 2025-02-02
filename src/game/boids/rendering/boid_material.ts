import { StandardDiffuseMaterial } from "@engine/renderer/material";
import Scene from "@engine/scene";

import MatrixShasder from "./../shaders/matrix.wgsl";
import InstancedShader from "./../shaders/shaders.wgsl";
import {createStructs } from "@engine/ts-compute/datatypes";
import { BoidObjectData } from "../boid_compute";

export default class BoidMaterial extends StandardDiffuseMaterial {

  private buffer: GPUBuffer;

  constructor(scene: Scene, objectBuffer: GPUBuffer) {
    const structCode = createStructs([BoidObjectData]);
    super(scene, [], structCode + MatrixShasder + InstancedShader);
    this.buffer = objectBuffer;
  }

  setupUniforms(): void {
    super.setupUniforms();
    this.setUniformEntry("objects", {
      binding: 5,
      resource: {
        buffer: this.buffer
      }
    })
  }

}
