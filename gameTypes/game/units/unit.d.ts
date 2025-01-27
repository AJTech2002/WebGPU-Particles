import { Vector3 } from "../../engine/math/src";
import Component from "../../engine/scene/component";
import BoidInstance from "../boids/boid_instance";
import { UnitType } from "../squad/squad";
export declare class Unit extends Component {
    private _health;
    private boidInstance;
    private system;
    private _unitType;
    private _ownerId;
    constructor(ownerId: number, unitType: UnitType);
    awake(): void;
    get id(): number;
    get position(): Vector3;
    get boid(): BoidInstance;
    get health(): number;
    get alive(): boolean;
    get ownerId(): number;
    get unitType(): UnitType;
    private die;
    takeDamage(damage: number): void;
    private lastAttackTime;
    knockbackForce(id: number, force: Vector3): Promise<void>;
    attack(x: number, y: number): void;
}
