import Component from "../component";
import { mat4 } from "gl-matrix";
import { vec3 } from "gl-matrix";
import { Vector3 } from "../../math/src";
export declare enum ColliderShape {
    Square = 0,
    Circle = 1
}
export default class Collider extends Component {
    isStatic: boolean;
    model: mat4;
    inverted: mat4;
    size: vec3;
    shape: ColliderShape;
    isTrigger: boolean;
    constructor(size?: vec3, shape?: ColliderShape, isTrigger?: boolean, isStatic?: boolean);
    awake(): void;
    start(): void;
    get worldExtents(): Vector3;
    check2DRayIntersection(rayOrigin: vec3, rayDirection: vec3, rayDistance: number): boolean;
    update(deltaTime: number): void;
    render(deltaTime: number): void;
    destroy(): void;
}
