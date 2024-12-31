import { Euler, Matrix4, Quaternion, Vector3 } from "@math";
import Component from "../component";
import { mat4 } from "gl-matrix";
export default class TransformComponent extends Component {
    position: Vector3;
    private rotation;
    scale: Vector3;
    quaternion: Quaternion;
    matrix: Matrix4 | null;
    constructor();
    updateTransform(): void;
    rotateOnAxis(axis: Vector3, angle: number): void;
    localRotateOnAxis(axis: Vector3, angle: number): void;
    getEulerRotation(): Euler;
    setRotationFromEuler(euler: Euler): void;
    getForwardVector(): Vector3;
    transformVector(vector: Vector3, isDirection: boolean): Vector3;
    get worldPosition(): Vector3;
    get worldRotation(): Euler;
    get worldScale(): Vector3;
    get worldModelMatrix(): mat4;
    awake(): void;
    update(): void;
}
