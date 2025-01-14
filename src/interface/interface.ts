import { vec3 } from "gl-matrix";
import BoidScene from "../game/boid_scene";
import { Boid } from "../game/boids/boid";

export class GameContext {

  private scene: BoidScene;

  constructor(scene: BoidScene) {
    this.scene = scene;
  }

  public get mousePosition() : vec3 {
    return this.scene.inputSystem.mouseToWorld(0).toVec3();
  }

  public get units() : Boid[] {
    return this.scene.units;
  }

  public getUnit (index: number) : Boid {
    return this.scene.getUnit(index);
  }

}
