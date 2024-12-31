import Component from "@engine/scene/component";
import { mat4, vec3, vec4 } from "gl-matrix";
import { ObjectDataBuffer } from "./boid_buffers";
import { Boid } from "./boid";
interface BoidInitData {
    position: vec3;
    speed: number;
}
export interface BoidData {
    target: vec4;
    avoidance: vec4;
    hasTarget: boolean;
    speed: number;
}
export interface BoidObjectData {
    model: mat4;
    position: vec3;
}
export declare const boidComputeShader: string;
export default class BoidSystemComponent extends Component {
    private boidData;
    objectData: ObjectDataBuffer;
    private timeData;
    private deltaTimeData;
    private numBoids;
    private layout;
    private bindGroup;
    instanceCount: number;
    maxInstanceCount: number;
    private avoidancePipeline;
    private movementPipeline;
    boids: BoidData[];
    boidObjects: BoidObjectData[];
    boidRefs: Boid[];
    constructor();
    updateBoidInformation(): Promise<void>;
    private warned;
    addBoid(init: BoidInitData): Boid | undefined;
    setBoidPosition(index: number, position: vec3): void;
    setBoidTarget(index: number, target: vec3): void;
    awake(): void;
    update(dT: number): void;
}
export {};
