import Engine from "../engine/engine";
import Scene from "../engine/scene";
import GameObject from "../engine/scene/gameobject";
import BoidSystemComponent from "./boids/boid_system";
import { Vector3 } from "../engine/math/src";
import { Unit } from "./units/unit";
import { UnitType } from "./squad/squad";
export default class BoidScene extends Scene {
    boidSystem: BoidSystemComponent;
    protected gameManager: GameObject;
    private _units;
    private _idMappedUnits;
    codeWritingTarget: GameObject;
    awake(engine: Engine): void;
    get units(): Unit[];
    getUnit(index: number): Unit;
    createUnit(ownerId?: number, unitType?: UnitType, position?: Vector3, avoidanceForce?: number, textureIndex?: number, scale?: number, speed?: number, clampToGrid?: boolean): Unit | undefined;
    render(dT: number): void;
}
