import { Vector3 } from "../../engine/math/src";
import BoidInstance from "../boids/boid_instance";
import { Damageable } from "../components/damageable";
import { UnitType } from "../squad/squad";
export declare class Unit extends Damageable {
    private boidInstance;
    private system;
    private castle;
    private _unitType;
    private _ownerId;
    constructor(ownerId: number, unitType: UnitType);
    awake(): void;
    get id(): number;
    get position(): Vector3;
    get boid(): BoidInstance;
    get ownerId(): number;
    get unitType(): UnitType;
    private deathAnimation;
    private enemyColorPallete;
    private playerColorPallete;
    setUnitColor(): Promise<void>;
    protected handleDamage(amount: number): void;
    protected handleDeath(): void;
    private lastAttackTime;
    knockbackForce(id: number, force: Vector3): Promise<void>;
    attack(x: number, y: number): void;
}
