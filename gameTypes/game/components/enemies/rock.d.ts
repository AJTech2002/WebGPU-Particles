import { Vector3 } from "../../../engine/math/src";
import Collider from "../../../engine/scene/core/collider_component";
import { Damageable } from "../damageable";
export declare class Rock extends Damageable {
    direction: Vector3;
    speed: number;
    constructor();
    awake(): void;
    start(): void;
    private scaling;
    protected handleDeath(): void;
    scaleTo(toScale: number, duration: number): Promise<void>;
    private lifeTime;
    private t;
    update(dT: number): void;
    on_collision(collider: Collider): void;
}
