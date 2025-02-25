import { bobScaleAnimation } from "@engine/animations/bob.animation";
import { Damageable } from "./damageable";
import { Vector3 } from "@engine/math/src";
import BoidSystemComponent from "@game/boids/boid_system";
import Collider from "@engine/scene/core/collider_component";

export class Castle extends Damageable {
    constructor() {
        super(200, 0.5, 0);
    }

    start() {
        super.start();
        const boidSystem = this.scene.findObjectOfType<BoidSystemComponent>(BoidSystemComponent)!;
        boidSystem.addCollider(this.gameObject.getComponent<Collider>(Collider)!);
    }

    private async damageAnimation() {
        const ogScale = this.transform.scale.clone();
        const scaled = ogScale.clone().multiply(new Vector3(1.1, 1.1, 1.1));
        bobScaleAnimation(this.transform, ogScale, scaled, 0.1);
    }

    protected handleDamage(amount: number): void {
        super.handleDamage(amount);
        this.damageAnimation();
    }

    protected handleDeath(): void {
        super.handleDeath();
        const boidSystem = this.scene.findObjectOfType<BoidSystemComponent>(BoidSystemComponent)!;
        boidSystem.removeCollider(this.gameObject.getComponent<Collider>(Collider)!);
        this.gameObject.destroy();
    }

}
