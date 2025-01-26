import { ArrayUniform, Uniform } from "../renderer/uniforms";
import { DynamicUniform } from "./dynamic-uniform";
export interface QuickBuffer<T> {
    name: string;
    uniform: boolean;
    buffer: Uniform<T> | DynamicUniform<T> | ArrayUniform<T>;
}
export declare class QuickCompute {
    private shader;
    private entry;
    private buffers;
    private bindGroupLayoutEntries;
    private bindGroupEntries;
    private layout;
    private bindGroup;
    private computePipeline;
    private shaderModule;
    constructor(shader: string, entry: string, buffers: QuickBuffer<any>[]);
    private addBuffers;
    addComputePipeline(shader: string | GPUShaderModule, entryPoint: string): GPUComputePipeline;
    dispatch(workgroups: GPUIndex32): void;
    private setup;
}
