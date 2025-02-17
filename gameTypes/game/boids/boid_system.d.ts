import Component from "../../engine/scene/component";
import { vec3 } from "gl-matrix";
import Collider from "../../engine/scene/core/collider_component";
import { BoidGPUData, BoidInputData, BoidObjectData, BoidOutputData } from "./boid_compute";
import BoidInstance from "./boid_instance";
import GameObject from "../../engine/scene/gameobject";
import { GridComponent } from "../grid/grid";
import { DynamicUniform } from "../../engine/ts-compute/dynamic-uniform";
interface BoidInitData {
    position: vec3;
    speed: number;
    steeringSpeed: number;
    avoidanceForce: number;
    textureIndex: number;
    scale: number;
    clampToGrid: boolean;
}
interface BoidSpawnData {
    instance: BoidInstance;
    gameObject: GameObject;
    id: number;
}
interface BoidInformation {
    data: BoidOutputData;
}
export declare enum NeighbourType {
    Friendly = 0,
    Enemy = 1
}
export interface Neighbour {
    id: number;
    ownerId: number;
}
export interface BoidSearchFilter {
    ownerId?: number;
    range?: number;
}
export default class BoidSystemComponent extends Component {
    instanceCount: number;
    maxInstanceCount: number;
    boids: BoidInputData[];
    boidObjects: BoidObjectData[];
    idMappedBoidData: Map<number, BoidInformation>;
    idMappedIndex: Map<number, number>;
    indexMappedId: Map<number, number>;
    idMappedBoidRefs: Map<number, BoidInstance>;
    private colliderIndexMappedToType;
    hashMappedBoidRefs: Map<number, Neighbour[]>;
    boidRefs: BoidInstance[];
    private compute;
    private warned;
    private grid;
    private boidScale;
    private slots;
    private _colliders;
    constructor(grid: GridComponent);
    updateBoidInformation(): Promise<void>;
    getBoidInstance(boidId: number): BoidInstance | undefined;
    getBoidInfo(boidId: number): BoidInformation | undefined;
    getBoidIdsAtTile(x: number, y: number): Neighbour[];
    getBoidNeighbours(boidId: number): Neighbour[];
    getBoidsInTile(x: number, y: number, filter?: BoidSearchFilter): BoidInstance[];
    getBoidsInTiles(tiles: {
        x: number;
        y: number;
    }[], filter?: BoidSearchFilter): BoidInstance[];
    boidIdsToBoids(boidId: number[]): (BoidInstance | undefined)[];
    private boidIdCounter;
    removeBoid(boidId: number): void;
    addBoid(init: BoidInitData): BoidSpawnData | undefined;
    get objectBuffer(): GPUBuffer;
    get colliderStorageDyn(): DynamicUniform<Collider>;
    get colliders(): Collider[];
    get boidStorageDyn(): DynamicUniform<BoidGPUData>;
    setBoidInputData(index: number, data: Partial<BoidInputData>): void;
    setBoidModelData(index: number, data: Partial<BoidObjectData>): void;
    setGpuData(index: number, data: Partial<BoidGPUData>): void;
    getBoidIndex(id: number): number | undefined;
    addCollider(collider: Collider): void;
    removeCollider(collider: Collider): void;
    private dispatch;
    awake(): void;
    private updateBoidCount;
    update(dT: number): void;
}
export {};
