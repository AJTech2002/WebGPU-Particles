import Material from "@engine/renderer/material";
import Component from "@engine/scene/component";
export default class Mesh extends Component {
    name: string;
    protected vertexBuffer: GPUBuffer;
    protected vertices: Float32Array;
    protected vertexCount: number;
    private _material;
    private modelBuffer;
    bindGroup?: GPUBindGroup;
    constructor(material?: Material);
    setMaterial(material: Material): void;
    get material(): Material;
    getVertexBuffer(): GPUBuffer;
    getVertexCount(): number;
    getVertices(): Float32Array;
    awake(): void;
    update(dt: number): void;
}
export declare class QuadMesh extends Mesh {
    constructor(material?: Material);
}
