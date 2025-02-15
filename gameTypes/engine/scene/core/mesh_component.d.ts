import Material from "../../renderer/material";
import Component from "../component";
export default class Mesh extends Component {
    name: string;
    protected vertexBuffer: GPUBuffer;
    protected vertices: Float32Array;
    protected vertexCount: number;
    private _material;
    private _materials;
    private modelBuffer;
    bindGroup?: GPUBindGroup;
    manualUpdate: boolean;
    constructor(material?: Material);
    addMaterial(material: Material): void;
    getMaterial<T extends Material>(type: new (...args: any[]) => T): T;
    removeMaterial<T extends Material>(type: new (...args: any[]) => T): void;
    private _needsUpdate;
    set needsUpdate(value: boolean);
    get needsUpdate(): boolean;
    onPreDraw(): void;
    onPostDraw(): void;
    get mainMaterial(): Material;
    get materials(): Material[];
    getVertexBuffer(): GPUBuffer;
    getVertexCount(): number;
    getVertices(): Float32Array;
    awake(): void;
    update(dt: number): void;
}
export declare class QuadMesh extends Mesh {
    constructor(material?: Material);
}
