import { Vector3 } from "../engine/math/src";
import { BaseLevelScene } from "./test_enemy_scene";
interface Group {
    numUnits: number;
    boss?: boolean;
    minDelay?: number;
    maxDelay?: number;
}
interface Wave {
    groups: Group[];
}
export interface EnemyLevelSettings {
    waves: Wave[];
}
export interface BasicLevelSettings {
    startingUnits: number;
    enemySettings: EnemyLevelSettings;
}
export declare class BasicLevel extends BaseLevelScene {
    private settings;
    constructor(settings: BasicLevelSettings);
    init(): Promise<void>;
    runWave(wave: Wave): Promise<void>;
    waitForGroup(group: Group, position: Vector3, minDelay?: number, maxDelay?: number): Promise<void>;
    start(): void;
}
export {};
