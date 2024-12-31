import { ArrayUniform } from "@engine/renderer/uniforms";
import { BoidData, BoidObjectData } from "./boid_component";
export declare class BoidDataBuffer extends ArrayUniform<BoidData> {
    constructor(maxInstanceCount: number);
    protected setArrayData(index: number, data: BoidData): void;
    getArrayData(index: number, f32Array: Float32Array): BoidData | null;
}
export declare class ObjectDataBuffer extends ArrayUniform<BoidObjectData> {
    constructor(maxInstanceCount: number);
    protected setArrayData(index: number, data: BoidObjectData): void;
    protected getArrayData(index: number, f32Array: Float32Array): BoidObjectData | null;
}
