import Component from "../../engine/scene/component";
import { vec3 } from "gl-matrix";
import { BoidInterface } from "./interfaces/boid_interface";
import { BoidGPUData, BoidInputData, BoidObjectData, BoidOutputData } from "./boid_compute";
import { Grid } from "../grid/grid_go";
import BoidInstance from "./boid_instance";
interface BoidInitData {
    position: vec3;
    speed: number;
    steeringSpeed: number;
}
interface BoidInformation {
    data: BoidOutputData;
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
    hashMappedBoidRefs: Map<number, number[]>;
    boidRefs: BoidInstance[];
    private compute;
    private warned;
    private grid;
    private boidScale;
    constructor(grid: Grid);
    updateBoidInformation(): Promise<void>;
    getBoidInstance(boidId: number): BoidInstance | undefined;
    getBoidInfo(boidId: number): BoidInformation | undefined;
    getBoidIdsAtTile(x: number, y: number): number[];
    getBoidNeighbours(boidId: number): number[];
    boidIdsToBoids(boidId: number[]): (BoidInstance | undefined)[];
    private boidIdCounter;
    addBoid(init: BoidInitData): BoidInterface | undefined;
    get objectBuffer(): GPUBuffer;
    setBoidInputData(index: number, data: Partial<BoidInputData>): void;
    setBoidModelData(index: number, data: Partial<BoidObjectData>): void;
    setGpuData(index: number, data: Partial<BoidGPUData>): void;
    getBoidIndex(id: number): number | undefined;
    private dispatch;
    awake(): void;
    private updateBoidCount;
    update(dT: number): void;
}
export {};
