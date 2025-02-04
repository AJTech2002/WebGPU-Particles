import { Vector3 } from "@engine/math/src";
import Component from "@engine/scene/component";

/* Super Simple for now - just collision resolution */

export class Rigidbody extends Component {
  public velocity: Vector3 = new Vector3(0, 0, 0);
  public mass: number = 1;

  public awake() {
    this.gameObject.scene.physics.addRigidbody(this);
  }

  public update(deltaTime: number) {
    this.gameObject.transform.position.add(this.velocity.clone().multiplyScalar(deltaTime));
  }
}