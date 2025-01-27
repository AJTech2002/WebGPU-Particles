import Engine from "../engine/engine";
import Scene from "../engine/scene";
import { Unit } from "./units/unit";
import { UnitType } from "./squad/squad";
export default class BoidScene extends Scene {
    private boidSystem;
    private grid;
    private _units;
    private _idMappedUnits;
    createCollider(): void;
    spinSquare(): Promise<void>;
    awake(engine: Engine): void;
    get units(): Unit[];
    getUnit(index: number): Unit;
    createUnitAtMouse(ownerId?: number, unitType?: UnitType): Unit | undefined;
    render(dT: number): void;
}
