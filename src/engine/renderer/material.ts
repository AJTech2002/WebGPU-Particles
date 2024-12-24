import { makeBindGroupLayoutDescriptors, makeShaderDataDefinitions } from "webgpu-utils";
import Mesh from "../scene/core/mesh_component";
import BasicFragShader from "@renderer/shaders/simple_shader.wgsl";
import BasicTextureFragShader from "@renderer/shaders/simple_textured_shader.wgsl";
import Scene from "../scene";
import { renderTargetFormat, device } from "@engine/engine";
import Texture from "@engine/texture";


export default class Material {
  private device: GPUDevice;
  public pipeline: GPURenderPipeline;
  public bindGroup?: GPUBindGroup;

  protected bindGroupLayout: GPUBindGroupLayout;
  public meshBindGroupLayout: GPUBindGroupLayout;

  private bindGroupEntriesMap: Map<string, GPUBindGroupEntry> = new Map();
  private bindGroupEntries: GPUBindGroupEntry[] = [];

  public meshes: Mesh[] = [];
  public instanceCount: number = 1;

  public name: string = "Material";

  // protected renderer: Renderer;

  constructor(shader: string) {
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

    const module = device.createShaderModule({ code: shader });
    const defs = makeShaderDataDefinitions(shader);

    const pipelineDesc = {
      vertex: {
        module,
        entryPoint: "vs_main",
        buffers: [triangleBufferLayout], // This is passed in because it depends on how the mesh is structured
      },
      fragment: {
        module,
        entryPoint: "fs_main",
        targets: [{ format: renderTargetFormat }],
      },
    };

    const descriptors = makeBindGroupLayoutDescriptors(defs, pipelineDesc);
    let layouts : GPUBindGroupLayout[] = [];
    descriptors.forEach((desc) => { 
      layouts.push(device.createBindGroupLayout(desc));  
    });

    const layout = device.createPipelineLayout({
      bindGroupLayouts: layouts,
    });

    const pipeline = device.createRenderPipeline({
      layout,
      ...pipelineDesc,
    });

   

    this.pipeline = pipeline;

    this.bindGroupLayout = layouts[0]; // 0 = Global
    this.meshBindGroupLayout = layouts[1]; // 1 = Mesh
   
  }

  public start() {
    this.setupBuffer();
  }

  protected setupUniforms() {
    // This is where the material should store the bind group entries
  }

  protected setupBuffer() {    
    this.setupUniforms();

    this.bindGroup = this.device.createBindGroup({
      layout: this.bindGroupLayout,
      entries: this.bindGroupEntries,
    });
  }

  protected setUniformEntry(key: string, entry: GPUBindGroupEntry) {
    if (this.bindGroupEntriesMap.has(key)) {
      const index = this.bindGroupEntries.indexOf(this.bindGroupEntriesMap.get(key)!);
      this.bindGroupEntries[index] = entry;
    }
    else {
      this.bindGroupEntries.push(entry);
      this.bindGroupEntriesMap.set(key, entry);
    }
  }
}


export class StandardMaterial extends Material {

  private scene: Scene;

  constructor(scene: Scene, shader?: string) {
    super(shader ?? BasicFragShader);
    this.scene = scene;
  }

  protected override setupUniforms() {
    console.log("Setting up uniforms for StandardMaterial");

    // All Standard Materials will have a cameraUniforms buffer
    // TODO: This can come from a global bind group!
    this.setUniformEntry("globalUniforms", {
      binding: 0,
      resource: {
        buffer: this.scene.renderer.uniforms,
      },
    });


  }

}


export class StandardDiffuseMaterial extends StandardMaterial {
  
  private texture!: Texture;
  
  constructor(scene: Scene, url?: string) {
    super(scene, BasicTextureFragShader);
    this.texture = new Texture();

    if (url) {
      (() => this.textureUrl = url)(); // Load the texture
    }
  }

  override setupUniforms() {
    super.setupUniforms();

    this.setUniformEntry("diffuseTexture", {
      binding: 1,
      resource: this.texture.view
    });

    this.setUniformEntry("sampler", {
      binding: 2,
      resource: this.texture.sampler
    });
  }

  public set textureUrl(url: string) {
    this.texture.loadTexture(url).then(() => {
      // recreate bind group
      this.setupBuffer();
    });
  }
  
}