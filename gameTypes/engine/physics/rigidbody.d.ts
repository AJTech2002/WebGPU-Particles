import { Vector3 } from "../math/src";
import Component from "../scene/component";
import Collider from "../scene/core/collider_component";
export declare class Rigidbody extends Component {
    hashedIndex: number;
    velocity: Vector3;
    mass: number;
    collider: Collider | null;
    layer: number;
    private lastPosition;
    awake(): void;
    start(): void;
    setLayer(layer: number): void;
    update(deltaTime: number): void;
    destroy(): void;
}
