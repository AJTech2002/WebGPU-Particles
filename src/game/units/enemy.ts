import { Vector3 } from "@engine/math/src";
import Component from "@engine/scene/component";
import { Unit } from "./unit";
import { Castle } from "@game/components/castle";

export class BaseEnemy extends Component {

    private unit!: Unit;
    private castles: Castle[] = [];
    private targetCastle: Castle;

    public awake(): void {
        super.awake();
        this.unit = this.gameObject.getComponent<Unit>(Unit)!;

        this.castles = this.scene.findObjectsOfType<Castle>(Castle);
        // find random
        this.targetCastle = this.castles[Math.floor(Math.random() * this.castles.length)];
    }

    public start(): void {
        super.start();
    }

    public setTargetCastle(castle: Castle): void {
        this.targetCastle = castle;
    }

    public update(dT: number): void {

        super.update(dT);

        // move towards center

        if (this.targetCastle?.transform !== undefined) {
            const dir = this.targetCastle.transform.position.clone().sub(this.unit.position).normalize();
            this.unit.boid.moveTo(this.targetCastle.transform.position.x, this.targetCastle.transform.position.y);
            this.unit.attack(dir.x, dir.y);
        }
        else {
            // find anothter castle
        }
    }


}
