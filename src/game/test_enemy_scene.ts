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

export class TestEnemyScene extends BoidScene {

  private maxEnemies = 100;
  private spawnedEnemies: Unit[] = [];
  private castle!: Collider;

  public spawnEnemy(
    position: Vector3,
    unitType: UnitType,
  ) : Unit | undefined {


    if (this.spawnedEnemies.length > this.maxEnemies) {
      return undefined;
    }

    const u = this.createUnit(1, unitType, position);
    u?.gameObject.addComponent(new BaseEnemy());
    if (u) {
      this.spawnedEnemies.push(u);
    }

    return u;
  }

  public override raycast(start: Vector3, direction: Vector3, distance: number): Collider[] {
    
    // just check the castle
    if (this.castle.check2DRayIntersection(
      start.toVec3(),
      direction.toVec3(),
      distance,
    )) {
      return [this.castle];
    }

    return [];
  }

  awake(engine: Engine): void {
    super.awake(engine);

    // create the central castle
    const castle = CastlePrefab(this);
    this.castle = castle.getComponent<Collider>(Collider)!

    // This is cool, we can listen to the death event of the castle
    this.castle.gameObject.getComponent(Damageable)!.on("death", () => {
      console.log("Castle destroyed");
    });
  }

  render(dT: number): void {
    super.render(dT);
    this.spawnEnemy(new Vector3(0, 0, 0), "Soldier");
  }

  mouseEvent(type: number, button: number): void {
    super.mouseEvent(type, button);
    if (type === 0 && button === 0) {
      // // perform raycast
      // const rayOrigin = this.input.mouseToWorld(0).toVec3();
      // const rayDirection : vec3 = [-1, 0, 0];
      // const rayDistance = 0.2;
      // const rayEnd = vec3.add(vec3.create(), rayOrigin, vec3.scale(vec3.create(), rayDirection, rayDistance));

      // Debug.line(
      //   new Vector3(rayOrigin[0], rayOrigin[1], rayOrigin[2]),
      //   new Vector3(rayEnd  [0], rayEnd  [1], rayEnd  [2]),
      //   new Color(1, 0, 0),
      //   2.0
      // );

      // const allColliders = this.findObjectsOfType(Collider);

      // for (let i = 0; i < allColliders.length; i++) {
      //   const collider = allColliders[i];
      //   const didHit = collider.check2DRayIntersection(
      //     rayOrigin,
      //     rayDirection,
      //     rayDistance,
      //   );
      //   if (didHit) {
      //     if (collider.gameObject.getComponent(Damageable)) {
      //       collider.gameObject.getComponent(Damageable)!.takeDamage(100);
      //     }
      //   }
      // }

    }
  }

}