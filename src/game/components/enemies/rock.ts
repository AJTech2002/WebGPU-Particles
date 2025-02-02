import { Vector2, Vector3 } from "@engine/math/src";
import Component from "@engine/scene/component";
import Collider from "@engine/scene/core/collider_component";
import BoidSystemComponent from "@game/boids/boid_system";
import { Damageable } from "../damageable";


export class Rock extends Damageable {

  public direction: Vector3 = new Vector3(0,0,0);
  public speed: number = 3;

  constructor() {
    super(100);
  }

  public awake(): void {
    this.transform.scale = new Vector3(0.0, 0.0, 0.0);
  }

  public start(): void {
    this.scaleTo(1.0, 0.2);
  }

  protected handleDeath(): void {
    // Remove collider from boid system
    this.scene.findObjectOfType(BoidSystemComponent)?.removeCollider(this.gameObject.getComponent(Collider)!);
    this.scaleTo(0.0, 0.1).then(() => {
      this.gameObject.destroy();
    });
  }

  async scaleTo(toScale: number, duration: number) {
    let t = 0;
    const startScale = this.transform.scale.clone();
    while (t < duration) {
      t += this.scene.dT / 1000;
      this.transform.scale = startScale.clone().lerp(new Vector3(toScale, toScale, toScale), t / duration);
      await this.scene.tick();
    }
  }

  private lifeTime = 2.0;
  private t = 0;

  public update(dT: number): void {
    super.update(dT);

    // // move in direction
    if (this.direction.length() > 0) {
      this.transform.position = this.transform.position.add(this.direction.clone().multiplyScalar(this.speed * dT));
    }
    // // rotate 
    this.gameObject.transform.rotateOnAxis(new Vector3(0,0,1), 5.0 * dT);

    this.t += dT;

    if (this.t > this.lifeTime) {
      this.handleDeath();
    }

  }

}