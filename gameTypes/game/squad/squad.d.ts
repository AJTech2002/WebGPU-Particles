import { Vector3 } from "../../engine/math/src";
import BoidScene from "../boid_scene";
import { BoidInterface } from "../player/interface/boid_interface";
import { Unit } from "../units/unit";
export type UnitType = "Soldier" | "Archer" | "Giant";
export interface UnitTypeDef {
    type: UnitType;
    count: number;
}
export interface SquadDef {
    id: number;
    name: string;
    unitTypes: UnitTypeDef[];
    color: string;
    code: string;
    preCode?: string;
    transpiledCode?: string;
}
export declare const EmptySquad: SquadDef;
export declare class Squad {
    units: BoidInterface[];
    private unitsMappedToType;
    constructor(units: BoidInterface[]);
    protected start(): void;
    addUnit(unit: BoidInterface): void;
    getUnitsOfType(type: UnitType): BoidInterface[];
    getUnits(): BoidInterface[];
    getUnitCount(): number;
    destroy(): void;
}
export declare class EnemySquad {
    protected scene: BoidScene;
    private _units;
    constructor(scene: BoidScene);
    spawnEnemy(position: Vector3, unitType: UnitType, count: number): Unit[];
    get units(): Unit[];
}
