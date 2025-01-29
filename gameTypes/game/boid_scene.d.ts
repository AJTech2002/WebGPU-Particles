import Engine from "../engine/engine";
import Scene from "../engine/scene";
import GameObject from "../engine/scene/gameobject";
import BoidSystemComponent from "./boids/boid_system";
import { Vector3 } from "../engine/math/src";
import { Unit } from "./units/unit";
import { UnitType } from "./squad/squad";
import { GridComponent } from "./grid/grid_go";
export default class BoidScene extends Scene {
    protected boidSystem: BoidSystemComponent;
    protected grid: GridComponent;
    protected gameManager: GameObject;
    private _units;
    private _idMappedUnits;
    createCollider(): void;
    spinSquare(): Promise<void>;
    awake(engine: Engine): void;
    get units(): Unit[];
    getUnit(index: number): Unit;
    createUnit(ownerId?: number, unitType?: UnitType, position?: Vector3): Unit | undefined;
    render(dT: number): void;
}
