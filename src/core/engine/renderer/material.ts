import { makeBindGroupLayoutDescriptors, makeShaderDataDefinitions } from "webgpu-utils";
import Mesh from "@engine/mesh/mesh";
import { Renderer } from "@renderer/renderer";
import BasicFragShader from "./renderer/shaders/shaders.wgsl";


export default class Material {
  private device: GPUDevice;
  public pipeline: GPURenderPipeline;
  public bindGroup?: GPUBindGroup;
  protected bindGroupLayout: GPUBindGroupLayout;

  private bindGroupEntriesMap: Map<string, GPUBindGroupEntry> = new Map();
  private bindGroupEntries: GPUBindGroupEntry[] = [];
  
  public meshes: Mesh[] = [];
  public instanceCount: number = 0;

  protected renderer: Renderer;
  
  constructor(
    renderer: Renderer,
    shader: string,
  ) {

    const device = renderer.device;
    const format = renderer.format;

    this.device = device;
    this.renderer = renderer;

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

    const module = device.createShaderModule({code: shader});
    const defs = makeShaderDataDefinitions(shader);
    
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
    this.setupUniforms();
  }

  protected setupUniforms() : void {
    // This is where the material should store the bind group entries
  }

  protected setupBuffer() {
    
    this.setupUniforms();

    this.bindGroup = this.device.createBindGroup({
      layout: this.bindGroupLayout,
      entries: this.bindGroupEntries,
    });
  }

  protected addUniformEntry(key: string, entry: GPUBindGroupEntry) {
    this.bindGroupEntries.push(entry);
    this.bindGroupEntriesMap.set(key, entry);
  }
}


export class StandardMaterial extends Material {

  constructor(renderer: Renderer) {
    super(renderer, BasicFragShader);
  }

  override setupUniforms() : void {
    // All Standard Materials will have a cameraUniforms buffer
    this.addUniformEntry("globalUniforms", {
      binding: 0,
      resource: {
        buffer: this.renderer.uniforms, // This buffer should be made somewhere else?
      }
    });
  }

}