import { Color } from "@engine/math/src";
import { Vector3 } from "@engine/math/src";
import BoidScene from "./boid_scene";
import { Unit } from "./units/unit";
import { UnitType } from "./squad/squad";
import Engine from "@engine/engine";
import Collider from "@engine/scene/core/collider_component";
import { vec3 } from "gl-matrix";
import { Debug } from "@engine/debug/debug";
import { CastlePrefab } from "./prefabs/castle.prefab";
import { Damageable } from "./components/damageable";
import {BaseEnemy} from "./units/enemy";
import { Boss } from "./prefabs/boss.prefab";

export class TestEnemyScene extends BoidScene {

  private maxEnemies = 100;
  private spawnedEnemies: Unit[] = [];

  public spawnEnemy(
    position: Vector3,
    unitType: UnitType,
  ) : Unit | undefined {

    if (this.spawnedEnemies.length > this.maxEnemies) {
      return undefined;
    }

    const u = this.createUnit(1, unitType, position, 1.0, 0);
    u?.gameObject.addComponent(new BaseEnemy());
    if (u) this.spawnedEnemies.push(u);

    return u;
  }

  public bigBoss (position: Vector3) {
    const boss = Boss(this);
    boss.transform.position = new Vector3(position.x, position.y, -7);
  }

  public override raycast(start: Vector3, direction: Vector3, distance: number): Collider[] { 
    return [];
  }

  awake(engine: Engine): void {
    super.awake(engine);
  }

  async spawn () {
    while (true) {
      await this.seconds(0.1);

      const randomAngle = Math.random() * Math.PI * 2;
      const distance = 3;

      const x = Math.cos(randomAngle) * distance;
      const y = Math.sin(randomAngle) * distance;


      this.spawnEnemy(new Vector3(x, y, 0), "Soldier");
    }
  }

  start(): void {
    // this.spawn();
    this.bigBoss(new Vector3(0, 0, 0));
  }

  render(dT: number): void {
    super.render(dT);
    
  }


}