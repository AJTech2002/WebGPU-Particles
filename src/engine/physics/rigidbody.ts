import { Vector3 } from "@engine/math/src";
import Component from "@engine/scene/component";
import Collider from "@engine/scene/core/collider_component";

/* Super Simple for now - just collision resolution */
export class Rigidbody extends Component {

  public hashedIndex : number = -1;
  public velocity: Vector3 = new Vector3(0, 0, 0);
  public mass: number = 1;
  public collider: Collider | null = null;
  public layer : number = 1 << 0;

  private lastPosition: Vector3 = new Vector3(0, 0, 0);

  public awake() {
    this.gameObject.scene.physics.addRigidbody(this);
  }

  public start(): void {
    this.collider = this.gameObject.getComponent<Collider>(Collider);
  }

  public setLayer (layer: number) {
    this.layer = 1 << layer;
  }

  public update(deltaTime: number) {

    const offset : Vector3 = this.transform.position.clone().sub(this.lastPosition);

    if (offset.length() > 0) {
      this.scene.physics.onRigidbodyMoved(this);
    }

    this.lastPosition.copy(this.transform.position);
  }

  public destroy(): void {
    super.destroy();
    this.gameObject.scene.physics.removeRigidbody(this);
  }
}