import { makeBindGroupLayoutDescriptors, makeShaderDataDefinitions } from "webgpu-utils";
import Mesh from "../mesh/mesh";
import BasicFragShader from "@renderer/shaders/simple_shader.wgsl";
import BasicTextureFragShader from "@renderer/shaders/simple_textured_shader.wgsl";
import Scene from "../scene";
import { renderTargetFormat } from "@engine/engine";
import Texture from "@engine/texture";


export default class Material {
  private device: GPUDevice;
  public pipeline: GPURenderPipeline;
  public bindGroup?: GPUBindGroup;
  protected bindGroupLayout: GPUBindGroupLayout;

  private bindGroupEntriesMap: Map<string, GPUBindGroupEntry> = new Map();
  private bindGroupEntries: GPUBindGroupEntry[] = [];

  public meshes: Mesh[] = [];
  public instanceCount: number = 1;

  public name: string = "Material";

  protected scene: Scene;
  // protected renderer: Renderer;

  constructor(scene: Scene, shader: string) {
    this.scene = scene;
    const device = this.scene.renderer.device;

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
   
  }

  public start() {
    this.setupBuffer();
  }

  protected setupUniforms() {
    // This is where the material should store the bind group entries
  }

  public onMeshRender(mesh: Mesh) {
    // This is where the material should update the bind group entries
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

  private modelBuffer: GPUBuffer | undefined;

  constructor(name: string, scene: Scene, shader?: string) {
    super(scene, shader ?? BasicFragShader);
    this.name = name;
  }


  protected override setupUniforms() {
    console.log("Setting up uniforms for StandardMaterial");

    const device = this.scene.renderer.device;

    this.modelBuffer = this.scene.renderer.device.createBuffer({
      size: 64,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    // All Standard Materials will have a cameraUniforms buffer
    this.setUniformEntry("globalUniforms", {
      binding: 0,
      resource: {
        buffer: this.scene.renderer.uniforms, // This buffer should be made somewhere else?
      },
    });

    device.queue.writeBuffer(this.modelBuffer, 0, new Float32Array(16).buffer);

    this.setUniformEntry("model", {
      binding: 1,
      resource: {
        buffer: this.modelBuffer,
      },
    })
  }

  public override onMeshRender(mesh: Mesh): void {
    const device = this.scene.renderer.device;
    if (this.modelBuffer) {
      device.queue.writeBuffer(this.modelBuffer, 0, <ArrayBuffer>mesh.transform);
    }
    else {
      console.error("ERR: Model buffer not initialized");
    }
  }
}


export class StandardDiffuseMaterial extends StandardMaterial {
  
  private texture!: Texture;
  
  constructor(name: string, scene: Scene) {
    super(name, scene, BasicTextureFragShader);
    this.texture = new Texture();
  }

  override setupUniforms() {
    super.setupUniforms();

    this.setUniformEntry("diffuseTexture", {
      binding: 2,
      resource: this.texture.view
    });

    this.setUniformEntry("sampler", {
      binding: 3,
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