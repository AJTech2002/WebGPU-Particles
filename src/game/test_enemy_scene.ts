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
import { Rigidbody } from "@engine/physics/rigidbody";
import GameObject from "@engine/scene/gameobject";
import { TestBoss } from "./components/enemies/test-boss";
import { TreeSpawner } from "./components/tree_spawner";
import Mesh from "@engine/scene/core/mesh_component";
import OutlineMaterial from "./boids/rendering/outline_material";
import { StandardDiffuseMaterial } from "@engine/renderer/material";
import { HouseSpawner } from "./components/house_spawner";

export enum TestEnemySceneLayers {
  BOSS = 1,
  TREE = 2,
}

export class BaseLevelScene extends BoidScene {

  private maxEnemies = 40;
  private spawnedEnemies: Unit[] = [];
  private treeSpawner!: TreeSpawner;

  public spawnEnemy(
    position: Vector3,
    unitType: UnitType,
  ) : Unit | undefined {

    if (this.spawnedEnemies.length > this.maxEnemies) {
      return undefined;
    }

    const u = this.createUnit(1, unitType, position, 1.0, 0, undefined, 0.5, false);
    u?.gameObject.addComponent(new BaseEnemy());
    if (u) this.spawnedEnemies.push(u);

    return u;
  }

  private boss!: TestBoss;

  public bigBoss (position: Vector3) {
    const bosGO= Boss(this);
    this.boss = bosGO.getComponent(TestBoss)!;
    this.boss.transform.position = new Vector3(position.x, position.y, -7);
    bosGO.getComponent(Rigidbody)?.setLayer(TestEnemySceneLayers.BOSS);
    this.physics.addCollisionMask(TestEnemySceneLayers.BOSS, TestEnemySceneLayers.BOSS, false);
    this.boidSystem.addCollider(bosGO.getComponent<Collider>(Collider)!);
    
  }

  public override raycast(start: Vector3, direction: Vector3, distance: number): Collider[] { 
    return [];
  }

  awake(engine: Engine): void {
    super.awake(engine);
    this.treeSpawner = this.gameManager.addComponent(
      new TreeSpawner()
    );

    this.gameManager.addComponent(
      new HouseSpawner()
    );
  }

  async spawn () {
    while (true) {
      await this.seconds(0.3);

      const randomAngle = Math.random() * Math.PI * 2;
      const distance = 0.3;

      const x = Math.cos(randomAngle) * distance;
      const y = Math.sin(randomAngle) * distance;


      this.spawnEnemy(new Vector3(x, y, 0), "Soldier");
    }
  }

  start(): void {
    // this.spawn();
    // this.bigBoss(new Vector3(0, 0, 0));
  }


  render(dT: number): void {
    super.render(dT);
    // follow boss to mouse

    // if (this.boss) {
    //   const mouse = this.input.mouseToWorld(0);
    //   if (this.input.getMouseButton(0)) {
    //     this.createUnit(0, "Soldier", mouse);
    //   }

    //   this._units.forEach(u => {
    //     u.moveTo(mouse.x, mouse.y);
    //     u.attackPosition(mouse.x, mouse.y);
    //   });
    // }
  }


}