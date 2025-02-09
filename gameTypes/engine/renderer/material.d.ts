import { PipelineDescriptor } from "webgpu-utils";
import Mesh from "../scene/core/mesh_component";
import Scene from "../scene";
import Engine from "../engine";
import { ColorUniform } from "./uniforms";
import { Color, Vector2 } from "../math/src/index.js";
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
    removeMesh(mesh: Mesh): void;
    protected setupUniforms(): void;
    protected setupBuffer(): void;
    protected setUniformEntry(key: string, entry: GPUBindGroupEntry): void;
}
export declare class StandardMaterial extends Material {
    private scene;
    colorUniform: ColorUniform;
    constructor(scene: Scene, shader?: string);
    protected setupUniforms(): void;
    get color(): Color;
    set color(value: Color);
}
export declare class StandardDiffuseMaterial extends StandardMaterial {
    private texture;
    private offsetUniform;
    private scaleUniform;
    private isMultiTexture;
    constructor(scene: Scene, url?: string[] | string, shaderOverride?: string);
    setupUniforms(): void;
    set textureUrl(url: string[]);
    set offset(value: Vector2);
    set scale(value: Vector2);
}
