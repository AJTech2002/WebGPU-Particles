import BoidInstance from "../boid_instance";
import { Vector3 } from "../../../engine/math/src";
import { UnitType } from "../../squad/squad";
import BoidScene from "src/game/boid_scene";
export declare class BoidInterface {
    private boidInstance;
    private boidScene;
    __origColor__: Vector3;
    unitType: UnitType;
    private _id;
    constructor(instance: BoidInstance, component: BoidScene);
    setUnitType(type: UnitType): void;
    get id(): number;
    get position(): Vector3;
    get alive(): boolean;
    get friendlyNeighbours(): BoidInterface[];
    get closestFriendlyNeighbour(): BoidInterface | undefined;
    kill(): void;
    move(x: number, y: number): void;
    moveTo(x: number, y: number): void;
    stop(): void;
    attack(target: BoidInterface): void;
    attack_dir(x: number, y: number): void;
}
