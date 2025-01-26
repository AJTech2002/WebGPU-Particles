import Component from "../../engine/scene/component";
import { BoidInputData, BoidOutputData } from "./boid_compute";
import { Vector3, Vector4 } from "../../engine/math/src";
import BoidSystemComponent from "./boid_system";
/**
 * BoidInstance
 * ====
 * Represents a single boid instance, handles memory transfer <-> to the GPU.
 * Is attached to a GameObject which stores the transform data of the boid.
 * Game Friendly access to the boid data.
 * This way we can attach components to boids for easy access to their data (eg. particle effects etc.)
 * This can be extended (ArrowBoidInstance, SoldierBoidInstance, etc.)
 */
export default class BoidInstance extends Component {
    private boidId;
    private boidIndex;
    private system;
    private _targetPosition;
    private _externalForce;
    private _diffuseColor;
    private _hasTarget;
    private _speed;
    private _scale;
    private originalColor;
    private originalScale;
    private originalPosition;
    private _health;
    constructor(boidId: number, boidSystem: BoidSystemComponent, initial: BoidInputData, initialPosition: Vector3);
    get index(): number;
    set index(value: number);
    get id(): number;
    get health(): number;
    get alive(): boolean;
    get position(): Vector3;
    set position(value: Vector3);
    get targetPosition(): Vector3;
    set targetPosition(value: Vector3);
    get externalForce(): Vector3;
    set externalForce(value: Vector3);
    get diffuseColor(): Vector4;
    set diffuseColor(value: Vector4);
    get hasTarget(): boolean;
    set hasTarget(value: boolean);
    get speed(): number;
    set speed(value: number);
    get scale(): number;
    set scale(value: number);
    stop(): void;
    setGPUData(boidOutputData: BoidOutputData): void;
    getGPUInputData(): BoidInputData;
    private colorPalette;
    setUnitColor(): Promise<void>;
    knockbackForce(id: number, force: Vector3): Promise<void>;
    private die;
    takeDamage(damage: number): void;
    getNeighbours(): BoidInstance[];
    private lastAttackTime;
    attack(x: number, y: number): void;
    awake(): void;
}
