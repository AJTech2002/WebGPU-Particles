import { Color, Vector3 } from "../math/src";
export declare class Debug {
    static log(message: string): void;
    /**
     * Draws a debug line in the scene.
     *
     * @param start - The starting point of the line as a vec3.
     * @param end - The ending point of the line as a vec3.
     * @param color - The color of the line as a vec3.
     * @param durationS - Optional duration in seconds for which the line should be visible.
     */
    static line(_start: Vector3, _end: Vector3, color: Color, durationS?: number): void;
}
