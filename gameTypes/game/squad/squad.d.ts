import { BoidInterface } from "../player/interface/boid_interface";
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
    addUnit(unit: BoidInterface): void;
    getUnitsOfType(type: UnitType): BoidInterface[];
    getUnits(): BoidInterface[];
    getUnitCount(): number;
    destroy(): void;
}
