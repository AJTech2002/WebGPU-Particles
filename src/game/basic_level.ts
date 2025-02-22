import { Vector3 } from "@engine/math/src";
import { BaseLevelScene } from "./test_enemy_scene";
import { UnitType } from "./squad/squad";
import { Unit } from "./units/unit";
import { BaseEnemy } from "./units/enemy";


interface Group {
  numUnits: number;
  boss?: boolean;
  minDelay?: number; // If the previous group finishes early, how long to wait before starting this group
  maxDelay?: number; // If the previous group finishes late, how long to wait before starting this group
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

export class BasicLevel extends BaseLevelScene {

  private settings: BasicLevelSettings;

  constructor(settings: BasicLevelSettings) {
    super();
    this.settings = settings;  
  }

  async init() {
    await this.seconds(1);
    this.timeScale = 2.0;
    for (let i = 0; i < this.settings.startingUnits; i++) {
      this.createUnit(0, "Soldier", new Vector3(0, 0, 0), 1.0, 0);
    }
    await this.seconds(1);
    for (let i = 0; i < this.settings.enemySettings.waves.length; i++) {
      await this.runWave(this.settings.enemySettings.waves[i]);
    }
  }

  async runWave (wave: Wave) {
    for (let i = 0; i < wave.groups.length; i++) {
      const group = wave.groups[i];

      const nextGroup : Group | undefined = wave.groups.length > i + 1 ? wave.groups[i + 1] : undefined;

      // pick a random position greater than grid.width radius, but less than grid.width * 2
      const x = (Math.random() > 0.5 ? 1 : -1) * (Math.random() * this.grid.size.x/2 + this.grid.size.x/2);
      const y = (Math.random() > 0.5 ? 1 : -1) * (Math.random() * this.grid.size.y/2 + this.grid.size.y/2);

      const position = new Vector3(x, y, 0);

      await this.waitForGroup(group, position, nextGroup?.minDelay ?? 0, nextGroup?.maxDelay ?? 0);
    }
  }

  async waitForGroup(group: Group, position: Vector3, minDelay: number = 0, maxDelay: number = 0) {
    // check groups for completion
    const groupUnits: Unit[] = [];
    for (let j = 0; j < group.numUnits; j++) {
      groupUnits.push(this.spawnEnemy(position, "Soldier"));
    }

    const maxDelayPromise: Promise<void> = this.seconds(maxDelay ?? 0);
    const allDead = () => groupUnits.every(u => u.alive === false);
    const minDelayPromise: Promise<void> = this.seconds(minDelay ?? 0);
    
    await Promise.race([maxDelayPromise, this.until(allDead)]);
    await minDelayPromise;
    
  }

  start(): void {
    super.start();
    this.init();
  }

}