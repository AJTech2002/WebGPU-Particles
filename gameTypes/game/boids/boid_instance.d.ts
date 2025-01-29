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
    originalColor: Vector4;
    originalScale: number;
    originalPosition: Vector3;
    constructor(boidId: number, boidSystem: BoidSystemComponent, initial: BoidInputData, initialPosition: Vector3);
    get index(): number;
    set index(value: number);
    get id(): number;
    get alive(): boolean;
    get position(): Vector3;
    setAlive(alive: boolean): void;
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
    move(x: number, y: number): void;
    moveTo(x: number, y: number): void;
    getNeighbours(): BoidInstance[];
    awake(): void;
}
