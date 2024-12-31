import { vec3 } from "gl-matrix";
import BoidSystemComponent from "./boid_component";
export declare class Boid {
    boidId: number;
    private boidSystem;
    private initialPosition;
    constructor(component: BoidSystemComponent, boidId: number, position: vec3);
    get position(): vec3;
    get target(): vec3;
    set target(target: vec3);
    move(x: number, y: number): void;
    moveTo(x: number, y: number): void;
}
