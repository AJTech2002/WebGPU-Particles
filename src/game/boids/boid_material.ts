import Material, { StandardDiffuseMaterial } from "@engine/renderer/material";
import Scene from "@engine/scene";
import { TgpuBuffer } from "typegpu";
import { BoidObjectType } from "./boid_component";
import { root } from "@engine/engine";

import InstancedShader from "./shaders/shaders.wgsl";

export default class BoidMaterial extends StandardDiffuseMaterial {

  private buffer: TgpuBuffer<BoidObjectType>;

  constructor(scene: Scene, objectBuffer: TgpuBuffer<BoidObjectType>, url?: string) {
    super(scene, url, InstancedShader);
    this.buffer = objectBuffer;
  }

  setupUniforms(): void {
    super.setupUniforms();
    console.log("Setting up uniforms for boid material");
    this.setUniformEntry("objects", {
      binding: 3,
      resource: {
        buffer: root.unwrap(this.buffer)
      }
    })
  }

}