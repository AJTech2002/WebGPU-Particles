import { EventfulComponent } from "../../engine/scene/core/eventful_component";
type DamageEvents = {
    damage: number;
    death: void;
};
export declare class Damageable extends EventfulComponent<DamageEvents> {
    private _health;
    private _damageTimeout;
    constructor(health: number, damageTimeout?: number);
    get health(): number;
    get alive(): boolean;
    private _lastDamageTime;
    takeDamage(amount: number): void;
    die(): void;
    protected handleDamage(amount: number): void;
    protected handleDeath(): void;
}
export {};
