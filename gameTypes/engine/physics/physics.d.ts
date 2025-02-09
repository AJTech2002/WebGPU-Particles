import Scene from "../scene";
import { Rigidbody } from "./rigidbody";
import { GridComponent } from "../../game/grid/grid";
import { Vector3 } from "../math/src";
export declare class Physics {
    private rigidbodies;
    private scene;
    private grid;
    private collisionMasks;
    constructor(scene: Scene, grid: GridComponent);
    addRigidbody(rigidbody: Rigidbody): void;
    private rayDoesIntersect;
    raycast2D(origin: Vector3, direction: Vector3, distance: number, debug?: boolean): Rigidbody | null;
    addCollisionMask(layerA: number, layerB: number, canCollide: boolean): void;
    removeRigidbody(rigidbody: Rigidbody): void;
    private canCollide;
    private resolveCollision;
    private hashMapped;
    onRigidbodyMoved(rigidbody: Rigidbody): void;
    update(deltaTime: number): void;
}
