import { Vector3 } from "../../../engine/math/src";
import { GameDataBridge } from "./bridge";
import { UnitType } from "../../squad/squad";
export declare class BoidInterface {
    private bridge;
    private _id;
    constructor(id: number, bridge: GameDataBridge);
    private get data();
    get id(): number;
    get unitType(): UnitType;
    get ownerId(): number;
    get position(): Vector3;
    get alive(): boolean;
    private interfacesFromIds;
    get neighbours(): BoidInterface[];
    get friendlyNeighbours(): BoidInterface[];
    get enemyNeighbours(): BoidInterface[];
    getClosest(units: BoidInterface[]): BoidInterface | null;
    kill(): void;
    move(x: number, y: number): void;
    moveTo(x: number, y: number, distanceThreshold?: number): Promise<void>;
    stop(): void;
    attack(target: BoidInterface): void;
    attack_dir(x: number, y: number): void;
}
