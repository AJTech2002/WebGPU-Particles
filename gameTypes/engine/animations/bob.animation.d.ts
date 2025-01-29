import { Vector3 } from "../math/src";
import TransformComponent from "../scene/core/transform_component";
export declare const bobScaleAnimation: (transform: TransformComponent, startScale: Vector3, endScale: Vector3, durationS: number) => Promise<void>;
export declare const bobAnimation: (start: number, end: number, durationS: number, onChange: (v: number) => void) => Promise<void>;
