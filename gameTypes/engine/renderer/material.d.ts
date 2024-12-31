import { PipelineDescriptor } from "webgpu-utils";
import Mesh from "../scene/core/mesh_component";
import Scene from "../scene";
import Engine from "@engine/engine";
import { ColorUniform } from "./uniforms";
export default class Material {
    private device;
    bindGroup?: GPUBindGroup;
    pipeline: GPURenderPipeline;
    protected bindGroupLayout: GPUBindGroupLayout;
    meshBindGroupLayout: GPUBindGroupLayout;
    pipelineDescriptor: PipelineDescriptor;
    private bindGroupEntriesMap;
    private bindGroupEntries;
    meshes: Mesh[];
    instanceCount: number;
    name: string;
    private shader;
    constructor(shader: string);
    start(engine: Engine): void;
    dispose(): void;
    protected setupUniforms(): void;
    protected setupBuffer(): void;
    protected setUniformEntry(key: string, entry: GPUBindGroupEntry): void;
}
export declare class StandardMaterial extends Material {
    private scene;
    colorUniform: ColorUniform;
    constructor(scene: Scene, shader?: string);
    protected setupUniforms(): void;
}
export declare class StandardDiffuseMaterial extends StandardMaterial {
    private texture;
    constructor(scene: Scene, url?: string, shaderOverride?: string);
    setupUniforms(): void;
    set textureUrl(url: string);
}
