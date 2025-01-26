import Component from "../component";
import { mat4 } from "gl-matrix";
import { vec3 } from "gl-matrix";
export declare enum ColliderShape {
    Square = 0,
    Circle = 1
}
export default class Collider extends Component {
    isTrigger: boolean;
    isStatic: boolean;
    model: mat4;
    inverted: mat4;
    size: vec3;
    shape: ColliderShape;
    constructor(size?: vec3, shape?: ColliderShape, isTrigger?: boolean, isStatic?: boolean);
    awake(): void;
    start(): void;
    update(deltaTime: number): void;
    render(deltaTime: number): void;
    destroy(): void;
}
