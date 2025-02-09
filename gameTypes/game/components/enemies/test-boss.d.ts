import { Vector2, Vector3 } from "../../../engine/math/src";
import { Damageable } from "../damageable";
export declare class TestBoss extends Damageable {
    private rocks;
    private rockMaterial;
    private boidSystem;
    private movementSpeed;
    private originalScale;
    private grid;
    private material;
    private ogColor;
    constructor();
    awake(): void;
    start(): void;
    private activeSquad;
    private outterActiveSquad;
    private stateMachine;
    protected handleDamage(amount: number): void;
    protected handleDeath(): void;
    private damageAnim;
    private wander;
    private spawnRock;
    private steering;
    moveTo(position: Vector3): Promise<void>;
    throwRock(dir: Vector2): Promise<void>;
    throwRocks(): Promise<void>;
}
