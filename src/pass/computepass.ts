import Pass from "../core/engine/pass";
import computeShaderCode from "../shaders/compute.wgsl";
import matrixShader from "../shaders/matrix.wgsl";
import InstancedMesh from "../core/engine/mesh/instanced_mesh";

export default class ParticleComputePass extends Pass {
  private computePipeline : GPUComputePipeline;
  private meshes: InstancedMesh[] = [];

  constructor(device: GPUDevice, format: GPUTextureFormat) {
    super(device, format);
    this.bindGroupLayout = this.device.createBindGroupLayout({
      entries: [
        {
          binding: 0,
          visibility: GPUShaderStage.COMPUTE,
          buffer: { type: "storage" },
        },
        {
          binding: 1,
          visibility: GPUShaderStage.COMPUTE,
          buffer: { type: "storage" },
        }
      ],
    });


    this.computePipeline = this.device.createComputePipeline({
      layout: this.device.createPipelineLayout({
        bindGroupLayouts: [this.bindGroupLayout],
      }),
      compute: {
        module: this.device.createShaderModule({
          code: matrixShader + " \n " + computeShaderCode,
        }),
        entryPoint: "computeMain",
      },
    });
  }

  public addMesh(mesh: InstancedMesh) {
    this.meshes.push(mesh);
  }

  public run(
    commandEncoder: GPUCommandEncoder,
    context: GPUCanvasContext
  ): void {
    super.run(commandEncoder, context);
    const computePass = commandEncoder.beginComputePass();
    computePass.setPipeline(this.computePipeline);

    for (let mesh of this.meshes) {
      computePass.setBindGroup(0, mesh.getComputeBindGroup());
      computePass.dispatchWorkgroups(
        Math.ceil(mesh.getInstanceCount() / 64)
      );
    }
    computePass.end();
  }
}
