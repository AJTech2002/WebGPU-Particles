import { Vector3 } from "@engine/math/src";
import { BaseLevelScene } from "./test_enemy_scene";

export interface BasicLevelSettings {
  startingUnits: number;
}

export class BasicLevel extends BaseLevelScene {

  private settings: BasicLevelSettings;

  constructor(settings: BasicLevelSettings) {
    super();
    this.settings = settings;  
  }

  async init() {
    await this.seconds(1);
    for (let i = 0; i < this.settings.startingUnits; i++) {
      this.createUnit(0, "Soldier", new Vector3(0, 0, 0), 1.0, 0);
    }
  }

  start(): void {
    super.start();
    this.init();
  }

}