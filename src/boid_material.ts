import Material from "./material";
import BasicFragShader from "./renderer/shaders/shaders.wgsl";

export class BoidRenderingMaterial extends Material {
  constructor(device: GPUDevice, format: GPUTextureFormat) {
    super(
      device,
      BasicFragShader,
      BasicFragShader,
      format,
      [
        {
          binding: 0,
          visibility: GPUShaderStage.VERTEX,
          buffer: {},
        },
        {
          binding: 1,
          visibility: GPUShaderStage.VERTEX,
          buffer: {
            type: "read-only-storage",
            hasDynamicOffset: false,
          },
        },
        {
          binding: 2,
          visibility: GPUShaderStage.FRAGMENT,
          texture: {},
        },
        {
          binding: 3,
          visibility: GPUShaderStage.FRAGMENT,
          sampler: {},
        },
      ],
      [
        // These are the uniforms the material stores & is responsible for updating...
        // {
        //   binding: 0,
        //   resource: {
        //     buffer: scene.getCamera().buffer, // Should come from a global buffer
        //   },
        // },
        // {
        //   binding: 1,
        //   resource: {
        //     buffer: this.getObjectBuffer(),
        //   },
        // },
        // {
        //   binding: 2,
        //   resource: texture.view!,
        // },
        // {
        //   binding: 3,
        //   resource: texture.sampler!,
        // },
      ]
    );
  }
}
