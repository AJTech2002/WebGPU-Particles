import { Vector3 } from "../../../engine/math/src";
import { GameDataBridge } from "./bridge";
import { GameInterface } from "./game_interface";
export declare class EnemyInterface extends GameInterface {
    private _id;
    constructor(id: number, bridge: GameDataBridge);
    get id(): number;
    private get data();
    get unitType(): string;
    get ownerId(): number;
    get position(): Vector3;
    get alive(): boolean;
    get health(): number;
}
