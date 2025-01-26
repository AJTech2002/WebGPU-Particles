import BoidScene from "../../boid_scene";
import { BoidInterface } from "../../boids/interfaces/boid_interface";
import { vec3 } from "gl-matrix";
export declare class GameContext {
    private scene;
    constructor(scene: BoidScene);
    get mousePosition(): vec3;
    get units(): BoidInterface[];
    getUnit(index: number): BoidInterface;
    tick(): Promise<void>;
    seconds(seconds: number): Promise<void>;
}
