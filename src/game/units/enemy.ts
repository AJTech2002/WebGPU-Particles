import { Vector3 } from "@engine/math/src";
import Component from "@engine/scene/component";
import { Unit } from "./unit";

export class BaseEnemy extends Component {

  private unit! : Unit;

  public awake(): void {
    super.awake ();
    this.unit = this.gameObject.getComponent<Unit>(Unit)!;
  }

  public start(): void {
    super.start();
  }

  public update(dT: number): void {
    
    super.update(dT);

    // move towards center
    // const center = new Vector3(0,0,0);
    // const dir = center.sub(this.unit.position).normalize();
    // this.unit.boid.moveTo(center.x, center.y);
    // this.unit.attack(dir.x, dir.y);
  }


}