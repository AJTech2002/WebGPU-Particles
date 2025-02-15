import { BaseLevelScene } from "./test_enemy_scene";
export interface BasicLevelSettings {
    startingUnits: number;
}
export declare class BasicLevel extends BaseLevelScene {
    private settings;
    constructor(settings: BasicLevelSettings);
    init(): Promise<void>;
    start(): void;
}
