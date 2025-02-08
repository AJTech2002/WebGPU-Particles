import { makeBindGroupLayoutDescriptors, makeShaderDataDefinitions, PipelineDescriptor } from "webgpu-utils";
import Mesh from "../scene/core/mesh_component";
import BasicFragShader from "@renderer/shaders/simple_shader.wgsl";
import BasicTextureFragShader from "@renderer/shaders/simple_textured_shader.wgsl";
import Scene from "../scene";
import Engine, { renderTargetFormat, device } from "@engine/engine";
import Texture from "@engine/renderer/texture";
import { ColorUniform, Vec3Uniform } from "./uniforms";
import { Color, Vector2 } from "@math";

export default class Material {
  private device: GPUDevice;
  public bindGroup?: GPUBindGroup;

  public pipeline!: GPURenderPipeline;
  protected bindGroupLayout!: GPUBindGroupLayout;
  public meshBindGroupLayout!: GPUBindGroupLayout;
  public pipelineDescriptor!: PipelineDescriptor;

  private bindGroupEntriesMap: Map<string, GPUBindGroupEntry> = new Map();
  private bindGroupEntries: GPUBindGroupEntry[] = [];

  public meshes: Mesh[] = [];
  public instanceCount: number = 1;

  public name: string = "Material";


  private shader: string;

  // protected renderer: Renderer;

  constructor(shader: string) {
    this.device = device;
    this.shader = shader;
  }

  public start(engine: Engine) {

    const shader = this.shader;

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
    const layouts : GPUBindGroupLayout[] = [];
    descriptors.forEach((desc) => { 
      layouts.push(device.createBindGroupLayout(desc));  
    });

    const layout = device.createPipelineLayout({
      bindGroupLayouts: layouts,
    });

    const pipeline = device.createRenderPipeline({
      layout,
      ...pipelineDesc,
      primitive: {
        topology: "triangle-list",
      },
      depthStencil: engine.renderer.getDepthStencilState(),
    });

    this.pipeline = pipeline;

    // 0 = Global, 1 = Mesh, 2 = Material
    this.bindGroupLayout = layouts[1]; // 2 = Material
    this.meshBindGroupLayout = layouts[2]; // 1 = Mesh

    if (this.meshBindGroupLayout == undefined) {
      const layout = device.createBindGroupLayout({
        entries: [
          {
            binding: 0,
            visibility: GPUShaderStage.FRAGMENT | GPUShaderStage.VERTEX,
            buffer: { type: "uniform" },
          },
        ],
      });

      this.meshBindGroupLayout = layout;
    }

    this.setupBuffer();
  }

  public dispose() {

    this.bindGroup = undefined;
  }

  public removeMesh (mesh: Mesh) {
    const index = this.meshes.indexOf(mesh);
    if (index !== -1) {
      this.meshes.splice(index, 1);
    }
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
  public colorUniform: ColorUniform = new ColorUniform(new Color(1.0, 1.0, 1.0));

  constructor(scene: Scene, shader?: string) {
    super(shader ?? BasicFragShader);
    this.scene = scene;

    this.colorUniform.setup();
  }

  protected override setupUniforms() {
    super.setupUniforms();
    // Global Uniforms
    this.setUniformEntry("color", {
      binding: 0,
      resource: {
        buffer: this.colorUniform.gpuBuffer,
      }
    })
  }

  public set color(value: Color) {
    this.colorUniform.value = value;
  }

}


export class StandardDiffuseMaterial extends StandardMaterial {
  
  private texture!: Texture;

  private offsetUniform: Vec3Uniform = new Vec3Uniform([0,0,0]);
  private scaleUniform: Vec3Uniform = new Vec3Uniform([1, 1, 1])

  private isMultiTexture: boolean = false;

  constructor(scene: Scene, url?: string[] | string, shaderOverride?: string) {
    super(scene, shaderOverride ?? BasicTextureFragShader);
    
    if (Array.isArray(url)) {
      this.isMultiTexture = true;
    }

    console.log("isMultiTexture", this.isMultiTexture, url);

    this.texture = new Texture(this.isMultiTexture);

    if (url) {
      if (Array.isArray(url)) {
        (() => this.textureUrl = url)(); // Load the texture
      }
      else {
        this.texture = new Texture(false);
        (() => this.textureUrl = [url])(); // Load the texture
      }
    }

    this.offsetUniform.setup();
    this.scaleUniform.setup();
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

    this.setUniformEntry("offset", {
      binding: 3,
      resource: {
        buffer: this.offsetUniform.gpuBuffer,
      }
    });

    this.setUniformEntry("scale", {
      binding: 4,
      resource: {
        buffer: this.scaleUniform.gpuBuffer,
      }
    });
  }

  public set textureUrl(url: string[]) {
    if (url.length === 0) return;

    if (!this.isMultiTexture) {
      this.texture.loadTexture(url[0]).then(() => {
        // recreate bind group
        this.setupBuffer();
      });
    }
    else {
      this.texture.loadMultipleTextures(url).then(() => {
        // recreate bind group
        this.setupBuffer();
      });
    }
  }

  public set offset(value: Vector2) {
    this.offsetUniform.value = [value.x, value.y, 0];
  }

  public set scale(value: Vector2) {
    this.scaleUniform.value = [value.x, value.y, 1];
  }
  
}
