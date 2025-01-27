import { BoidInterface } from "@game/player/interface/boid_interface";

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

export const EmptySquad : SquadDef = {
  id: Math.random() * 1000,
  name: "New Squad",
  unitTypes: [
    {
      type: "Archer",
      count: 1
    },
    {
      type: "Soldier",
      count: 0
    },
    {
      type: "Giant",
      count: 0
    }
  ],
  code: "",
  color: "red",
}


export class Squad {

  public units: BoidInterface[];
  private unitsMappedToType: Map<UnitType, BoidInterface[]>;

  constructor (
    units: BoidInterface[],
  ) {
    this.units = units;
    
    this.unitsMappedToType = new Map();

    for (const unit of units) {
      this.unitsMappedToType.set(unit.unitType, [
        ...(this.unitsMappedToType.get(unit.unitType) || []),
        unit
      ]);
    }
  }

  public addUnit (unit: BoidInterface) {
    this.units.push(unit);
    this.unitsMappedToType.set(unit.unitType, [
      ...(this.unitsMappedToType.get(unit.unitType) || []),
      unit
    ]);
  }

  public getUnitsOfType (type: UnitType) : BoidInterface[] {
    return this.unitsMappedToType.get(type) || [];
  }

  public getUnits () {
    return this.units;
  }

  public getUnitCount () {
    return this.units.length;
  }

}