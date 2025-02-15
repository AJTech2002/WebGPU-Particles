import BoidScene from "../../boid_scene";
import { BoidInterfaceCommand, BoidInterfaceData, EnemyInterfaceData } from "./bridge_commands";
import { Vector3 } from "../../../engine/math/src";
import { BoidInterface } from "./boid_interface";
export declare class GameDataBridge {
    private scene;
    constructor(scene: BoidScene);
    private getBoid;
    private getUnit;
    private getUnits;
    getBoidData(id: number): BoidInterfaceData;
    getEnemyData(id: number): EnemyInterfaceData;
    tick(): Promise<void>;
    seconds(seconds: number): Promise<void>;
    until(condition: () => boolean): Promise<void>;
    sendGlobalCommand(command: BoidInterfaceCommand): void;
    sendCommand(command: BoidInterfaceCommand): void;
    get mousePosition(): Vector3;
    screenToWorld(x: number, y: number, z?: number, absolute?: boolean): Vector3;
    get boidInterfaces(): BoidInterface[];
    getBoidInterface(id: number): BoidInterface;
}
