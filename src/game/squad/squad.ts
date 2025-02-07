import { Vector3 } from "@engine/math/src";
import BoidScene from "@game/boid_scene";
import { BoidInterface } from "@game/player/interface/boid_interface";
import { BaseEnemy } from "@game/units/enemy";
import { Unit } from "@game/units/unit";

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

  protected start() {

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

  public destroy() {
    for (const unit of this.units) {
      unit.kill();
    }
  }

}

export class EnemySquad {

  protected scene: BoidScene;
  private _units: Unit[] = [];

  constructor (scene: BoidScene) {
    this.scene = scene;
  }

  public spawnEnemy(
    position: Vector3,
    unitType: UnitType,
    count: number
  ) : Unit[] {
    
    const u : Unit[] = [];
    for (let i = 0; i < count; i++) {
      const newUnit = this.scene.createUnit(1, unitType, position, 1.0, 0);
      newUnit?.gameObject.addComponent(new BaseEnemy());
      if (newUnit) {
        this._units.push(newUnit);
        u.push(newUnit); 
      }
    }

    return u;
  }

  public get units () {
    return this._units;
  }

}