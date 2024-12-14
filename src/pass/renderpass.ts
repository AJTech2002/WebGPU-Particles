import InstancedMesh from "../core/engine/mesh/instanced_mesh";
import Mesh from "../core/engine/mesh/mesh";
import shader from "../shaders/shaders.wgsl";
import Pass from "../core/engine/pass";

export default class ParticleRenderPass extends Pass {

  protected renderingPipeline!: GPURenderPipeline;
  private meshes: InstancedMesh[] = [];

  constructor(device: GPUDevice, format: GPUTextureFormat) {
    super(device, format);

    this.device = device;

    this.bindGroupLayout = this.device.createBindGroupLayout({
      entries: [
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
    });

    // This is what the material should store - based on the pipeline it belongs too
    

    const pipelineLayout = this.device.createPipelineLayout({
      bindGroupLayouts: [this.bindGroupLayout],
    });

    const triangleBufferLayout : GPUVertexBufferLayout = {
      arrayStride: 20,
      attributes: [
        {
          shaderLocation: 0,
          format: "float32x3", // vec3, position
          offset: 0,
        },
        {
          shaderLocation: 1,
          format: "float32x2", // vec2, uv
          offset: 12,
        },
      ],
    };

    this.renderingPipeline = this.device.createRenderPipeline({
      vertex: {
        module: this.device.createShaderModule({
          code: shader,
        }),
        entryPoint: "vs_main",
        buffers: [triangleBufferLayout],
      },

      fragment: {
        module: this.device.createShaderModule({
          code: shader,
        }),
        entryPoint: "fs_main",
        targets: [
          {
            format: format,
          },
        ],
      },

      primitive: {
        topology: "triangle-list",
      },

      layout: pipelineLayout,
    });
  }

  public addMesh(mesh: InstancedMesh) {
    this.meshes.push(mesh);
  }

  public override run(commandEncoder: GPUCommandEncoder, context: GPUCanvasContext) {
    const textureView: GPUTextureView = context.getCurrentTexture().createView();

    const renderpass: GPURenderPassEncoder = commandEncoder.beginRenderPass({
      colorAttachments: [{
          view: textureView,
          clearValue: { r:1.0, g: 1.0, b: 1.0, a: 1.0 },
          loadOp: "clear",
          storeOp: "store"
      }]
    });

    renderpass.setPipeline(this.renderingPipeline);

    for (let mesh of this.meshes) {
      renderpass.setVertexBuffer(0, mesh.getVertexBuffer());
      // This is where you can change the object buffer
      renderpass.setBindGroup(0, mesh.getRenderBindGroup());
      renderpass.draw(mesh.getVertexCount(), mesh.getInstanceCount(), 0, 0);
    }

    renderpass.end();
  }
}
