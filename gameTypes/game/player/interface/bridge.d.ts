import BoidScene from "../../boid_scene";
import BoidInstance from "../../boids/boid_instance";
import { BoidInterfaceCommand, BoidInterfaceData, EnemyInterfaceData } from "./bridge_commands";
import { Vector2, Vector3 } from "../../../engine/math/src";
import { BoidInterface } from "./boid_interface";
export declare class GameDataBridge {
    private scene;
    constructor(scene: BoidScene);
    private getBoid;
    private getUnit;
    private getUnits;
    getUnitsAtGrid(x: number, y: number): BoidInstance[];
    worldToGrid(x: number, y: number): {
        x: number;
        y: number;
    };
    getBoidData(id: number): BoidInterfaceData;
    getEnemyData(id: number): EnemyInterfaceData;
    tick(): Promise<void>;
    seconds(seconds: number): Promise<void>;
    until(condition: () => boolean): Promise<void>;
    sendGlobalCommand(command: BoidInterfaceCommand): void;
    sendCommand(command: BoidInterfaceCommand): void;
    get mousePosition(): Vector3;
    screenToWorld(x: number, y: number, z?: number, absolute?: boolean): Vector3;
    worldToScreen(pos: Vector3): Vector2;
    private interfaces;
    getOrCreateInterface(id: number): BoidInterface;
    getOrCreateInterfaces(instances: BoidInstance[]): BoidInterface[];
    get boidInterfaces(): BoidInterface[];
    getBoidInterface(id: number): BoidInterface;
}
