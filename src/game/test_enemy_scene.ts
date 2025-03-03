import { Color } from "@engine/math/src";
import { Vector3 } from "@engine/math/src";
import BoidScene, { UnitType } from "./boid_scene";
import { Unit } from "./units/unit";
import Engine from "@engine/engine";
import { BaseEnemy } from "./units/enemy";
import { TreeSpawner } from "./components/tree_spawner";
import { HouseSpawner } from "./components/managers/house_spawner";

export enum TestEnemySceneLayers {
  BOSS = 1,
  TREE = 2,
}

export class BaseLevelScene extends BoidScene {

  private maxEnemies = 40;
  private spawnedEnemies: Unit[] = [];

  public spawnEnemy(
    position: Vector3,
    unitType: UnitType,
  ): Unit | undefined {

    if (this.spawnedEnemies.length > this.maxEnemies) {
      return undefined;
    }

    const u = this.createUnit(1, unitType, position, 1.0, 0, undefined, 0.5, false);
    u?.gameObject.addComponent(new BaseEnemy());
    if (u) this.spawnedEnemies.push(u);

    return u;
  }

  awake(engine: Engine): void {
    super.awake(engine);
    this.gameManager.addComponent(
      new TreeSpawner()
    );

    this.gameManager.addComponent(
      new HouseSpawner()
    );
  }

  async spawn() {
    while (true) {
      await this.seconds(0.3);

      const randomAngle = Math.random() * Math.PI * 2;
      const distance = 0.3;

      const x = Math.cos(randomAngle) * distance;
      const y = Math.sin(randomAngle) * distance;


      this.spawnEnemy(new Vector3(x, y, 0), "Soldier");
    }
  }

  render(dT: number): void {
    super.render(dT);
  }


}
