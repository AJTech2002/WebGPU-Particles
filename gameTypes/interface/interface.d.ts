import BoidScene from "../game/boid_scene";
import { Boid } from "../game/boids/boid";
export declare class GameContext {
    private scene;
    constructor(scene: BoidScene);
    get units(): Boid[];
}
