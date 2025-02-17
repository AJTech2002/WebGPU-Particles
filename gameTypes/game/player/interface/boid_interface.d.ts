import { Vector3 } from "../../../engine/math/src";
import { GameDataBridge } from "./bridge";
import { UnitType } from "../../squad/squad";
import { GameInterface } from "./game_interface";
import { EnemyInterface } from "./enemy_interface";
import { Neighbour } from "../../boids/boid_system";
type Positional = {
    position: Vector3;
};
export declare class BoidInterface extends GameInterface {
    private _id;
    private mappedInterfaces;
    constructor(id: number, bridge: GameDataBridge);
    private get data();
    get id(): number;
    get unitType(): UnitType;
    get ownerId(): number;
    get position(): Vector3;
    get alive(): boolean;
    get neighbours(): Neighbour[];
    get friendlyNeighbours(): BoidInterface[];
    get enemyNeighbours(): EnemyInterface[];
    getClosest<Positional>(units: Positional[]): Positional | null;
    getClosestEnemy(): EnemyInterface | null;
    kill(): void;
    move(x: number, y: number): void;
    moveToPos(pos: Vector3): void;
    moveTo(x: number, y: number, distanceThreshold?: number): void;
    stop(): void;
    attack(target: Positional): void;
    attack_dir(x: number, y: number): void;
}
export {};
