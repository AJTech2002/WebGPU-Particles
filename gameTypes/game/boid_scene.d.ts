import Engine from "@engine/engine";
import Scene from "@engine/scene";
import { Boid } from "./boids/boid";
export default class BoidScene extends Scene {
    private boidSystem;
    awake(engine: Engine): void;
    get units(): Boid[];
    render(dT: number): void;
    inputEvent(type: number, key: string): void;
}
