import { BoidInterface } from "./boid_interface";
import { GameDataBridge } from "./bridge";
import { Vector3 } from "../../../engine/math/src";
export declare class GameContext {
    private bridge;
    constructor(bridge: GameDataBridge);
    get mousePosition(): Vector3;
    get units(): BoidInterface[];
    getUnit(index: number): BoidInterface;
}
