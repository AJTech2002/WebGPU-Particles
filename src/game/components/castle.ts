import { bobAnimation, bobScaleAnimation } from "@engine/animations/bob.animation";
import { Damageable } from "./damageable";
import { Color, Vector3 } from "@engine/math/src";
import { StandardDiffuseMaterial } from "@engine/renderer/material";

export class Castle extends Damageable {
  constructor() {
    super(1000, 0.5);
  }

  private async damageAnimation() {
    const ogScale = this.transform.scale.clone();
    const scaled = ogScale.clone().multiply(new Vector3(1.1, 1.1, 1.1));
    bobScaleAnimation(this.transform, ogScale, scaled , 0.1);

    const ogColor = new Color(1, 1, 1); 
    const red = new Color(1, 0.2, 0.2);

    await bobAnimation(0, 1, 0.1, (v) => {
      (this.gameObject.mesh!.mainMaterial as StandardDiffuseMaterial).color = ogColor.clone().lerp(red, v);
    })
  }

  protected handleDamage(amount: number): void {
    super.handleDamage(amount);
    console.log("Castle took damage: ", amount);
    this.damageAnimation();
  }

  protected handleDeath(): void {
    super.handleDeath();
    this.gameObject.destroy();
  }

}