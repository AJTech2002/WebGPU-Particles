import Pass from "../core/engine/pass";
import computeShaderCode from "../shaders/compute.wgsl";
import matrixShader from "../shaders/matrix.wgsl";
import InstancedMesh from "../../deprecated/instanced_mesh";

export default class ParticleComputePass extends Pass {
  private avoidancePipeline : GPUComputePipeline;
  private movementPipeline : GPUComputePipeline;

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
        },
        {
          // time uniform
          binding: 2,
          visibility: GPUShaderStage.COMPUTE,
          buffer: { type: "uniform" },
        },
        {
          // delta time uniform
          binding: 3,
          visibility: GPUShaderStage.COMPUTE,
          buffer: { type: "uniform" },
        }
      ],
    });


    this.avoidancePipeline = this.device.createComputePipeline({
      layout: this.device.createPipelineLayout({
        bindGroupLayouts: [this.bindGroupLayout],
      }),
      compute: {
        module: this.device.createShaderModule({
          code: matrixShader + " \n " + computeShaderCode,
        }),
        entryPoint: "avoidanceMain",
      },
    });

    this.movementPipeline = this.device.createComputePipeline({
      layout: this.device.createPipelineLayout({
        bindGroupLayouts: [this.bindGroupLayout],
      }),
      compute: {
        module: this.device.createShaderModule({
          code: matrixShader + " \n " + computeShaderCode,
        }),
        entryPoint: "movementMain",
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
    computePass.setPipeline(this.avoidancePipeline);

    for (let mesh of this.meshes) {
      computePass.setBindGroup(0, mesh.getComputeBindGroup());
      computePass.dispatchWorkgroups(
        Math.ceil(mesh.getInstanceCount() / 64)
      );
    }

    computePass.setPipeline(this.movementPipeline);

    for (let mesh of this.meshes) {
      computePass.setBindGroup(0, mesh.getComputeBindGroup());
      computePass.dispatchWorkgroups(
        Math.ceil(mesh.getInstanceCount() / 64)
      );
    }

    computePass.end();
  }
}
