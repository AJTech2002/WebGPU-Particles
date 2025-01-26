import Engine from "../engine/engine";
import Scene from "../engine/scene";
import { BoidInterface } from "./boids/interfaces/boid_interface";
export default class BoidScene extends Scene {
    private boidSystem;
    private grid;
    private boidInterfaces;
    private idMappedBoidRefs;
    createCollider(): void;
    spinSquare(): Promise<void>;
    spawnUnits(): Promise<void>;
    reportFPS(): Promise<void>;
    awake(engine: Engine): void;
    get units(): BoidInterface[];
    getUnit(index: number): BoidInterface;
    createUnitAtMouse(): BoidInterface | undefined;
    render(dT: number): void;
}
