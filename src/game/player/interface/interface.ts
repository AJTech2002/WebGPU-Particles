import { vec3 } from "gl-matrix";
import BoidScene from "../game/boid_scene";
import { BoidInterface } from "../game/boids/interfaces/boid_interface";

export class GameContext {

  private scene: BoidScene;

  constructor(scene: BoidScene) {
    this.scene = scene;
  }

  public get mousePosition() : vec3 {
    return this.scene.inputSystem.mouseToWorld(0).toVec3();
  }

  public get units() : BoidInterface[] {
    return this.scene.units;
  }

  public getUnit (index: number) : BoidInterface {
    return this.scene.getUnit(index);
  }

  public async tick() : Promise<void> {
    return await this.scene.tick();
  }

  public async seconds(seconds: number) : Promise<void> {
    return await this.scene.seconds(seconds);
  }

}
