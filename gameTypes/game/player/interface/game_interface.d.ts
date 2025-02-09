import { BoidInterface } from "./boid_interface";
import { GameDataBridge } from "./bridge";
import { Vector3 } from "../../../engine/math/src";
export declare class GameInterface {
    protected bridge: GameDataBridge;
    constructor(bridge: GameDataBridge);
}
export declare class GameContext extends GameInterface {
    get mousePosition(): Vector3;
    get units(): BoidInterface[];
    getUnit(index: number): BoidInterface;
    createSoldier(count?: number, position?: Vector3): void;
}
