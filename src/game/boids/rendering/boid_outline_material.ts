import { StandardDiffuseMaterial } from "@engine/renderer/material";
import Scene from "@engine/scene";

import MatrixShasder from "./../shaders/matrix.wgsl";
import BoidShader from "./../shaders/instanced_outline.wgsl";
import {createStructs } from "@engine/ts-compute/datatypes";
import { BoidObjectData } from "../boid_compute";
import { Color } from "@engine/math/src";

export default class BoidOutlineMaterial extends StandardDiffuseMaterial {

  private buffer: GPUBuffer;

  constructor(scene: Scene, objectBuffer: GPUBuffer) {
    const structCode = createStructs([BoidObjectData]);
    super(scene, [], structCode + MatrixShasder + BoidShader);
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
