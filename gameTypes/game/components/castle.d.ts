import { Damageable } from "./damageable";
export declare class Castle extends Damageable {
    constructor();
    private damageAnimation;
    protected handleDamage(amount: number): void;
    protected handleDeath(): void;
}
