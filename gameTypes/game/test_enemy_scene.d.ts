import { Vector3 } from "../engine/math/src";
import BoidScene from "./boid_scene";
import { Unit } from "./units/unit";
import { UnitType } from "./squad/squad";
import Engine from "../engine/engine";
import Collider from "../engine/scene/core/collider_component";
export declare enum TestEnemySceneLayers {
    BOSS = 1,
    TREE = 2
}
export declare class BaseLevelScene extends BoidScene {
    private maxEnemies;
    private spawnedEnemies;
    private treeSpawner;
    spawnEnemy(position: Vector3, unitType: UnitType): Unit | undefined;
    private boss;
    bigBoss(position: Vector3): void;
    raycast(start: Vector3, direction: Vector3, distance: number): Collider[];
    awake(engine: Engine): void;
    spawn(): Promise<void>;
    start(): void;
    render(dT: number): void;
}
