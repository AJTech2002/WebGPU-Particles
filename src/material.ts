import { makeBindGroupLayoutDescriptors, makeShaderDataDefinitions } from "webgpu-utils";
import Mesh from "./core/engine/mesh/mesh";

export default class Material {
  private device: GPUDevice;

  public pipeline: GPURenderPipeline;
  public bindGroup: GPUBindGroup;
  private bindGroupLayout: GPUBindGroupLayout;

  public meshes: Mesh[] = [];
  public instanceCount: number = 0;

  constructor(
    device: GPUDevice,
    fragShader: string,
    format: GPUTextureFormat,
  ) {
    this.device = device;
    const triangleBufferLayout: GPUVertexBufferLayout = {
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

    const module = device.createShaderModule({code: fragShader});
    const defs = makeShaderDataDefinitions(fragShader);
    
    const pipelineDesc = {
      vertex: {
        module,
        entryPoint: 'vs_main',
        buffers: [triangleBufferLayout], // This is passed in because it depends on how the mesh is structured
      },
      fragment: {
        module,
        entryPoint: 'fsMain',
        targets: [
          {format: format},
        ],
      },
    };
    
    const descriptors = makeBindGroupLayoutDescriptors(defs, pipelineDesc);
    const group0Layout = device.createBindGroupLayout(descriptors[0]);
    const layout = device.createPipelineLayout({
      bindGroupLayouts: [group0Layout],
    });
    const pipeline = device.createRenderPipeline({
      layout,
      ...pipelineDesc,
    });

    this.pipeline = pipeline;
    this.bindGroupLayout = group0Layout;


    // TODO: figure out how to create the bind group
    // https://greggman.github.io/webgpu-utils/docs/
    this.bindGroup = device.createBindGroup({
      layout: group0Layout,
      entries: [],
    });

  }
}
