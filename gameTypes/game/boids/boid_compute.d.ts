import Compute from "../../engine/ts-compute/compute";
import { mat4, vec3, vec4 } from "gl-matrix";
export declare class BoidInputData {
    targetPosition: vec4;
    externalForce: vec4;
    diffuseColor: vec4;
    hasTarget: boolean;
    speed: number;
    steeringSpeed: number;
    scale: number;
    alive: boolean;
    avoidanceForce: number;
    clampToGrid: boolean;
}
export declare class BoidGPUData {
    avoidanceVector: vec4;
    collisionVector: vec4;
    externalForce: vec4;
    lastModelPosition: vec4;
    steering: vec4;
    position: vec4;
}
export declare class BoidObjectData {
    model: mat4;
    diffuseColor: vec4;
    hash: number;
    boidId: number;
    visible: boolean;
    textureIndex: number;
}
export declare class BoidOutputData {
    position: vec3;
}
export declare class CollisionHitData {
    boidId: number;
    colliderId: number;
}
export declare const maxInstanceCount: number;
export declare class BoidCompute extends Compute {
    private collisionHitCount;
    private collisionHits;
    private objects;
    private boid_input;
    private boids;
    private boid_output;
    private colliders;
    private gridWidth;
    private time;
    private dT;
    private numBoids;
    private numColliders;
    constructor();
    init(): void;
    set Time(time: number);
    set DeltaTime(dt: number);
    set NumBoids(num: number);
    set NumColliders(num: number);
}
