import { Vector3 } from "../engine/math/src";
import BoidScene from "./boid_scene";
import { Unit } from "./units/unit";
import { UnitType } from "./squad/squad";
import Engine from "../engine/engine";
import Collider from "../engine/scene/core/collider_component";
export declare class TestEnemyScene extends BoidScene {
    private maxEnemies;
    private spawnedEnemies;
    private castle;
    spawnEnemy(position: Vector3, unitType: UnitType): Unit | undefined;
    raycast(start: Vector3, direction: Vector3, distance: number): Collider[];
    awake(engine: Engine): void;
    render(dT: number): void;
    mouseEvent(type: number, button: number): void;
}
