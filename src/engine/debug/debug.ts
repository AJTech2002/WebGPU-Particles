import { activeScene } from "@engine/engine";
import { Color, Euler, Vector3 } from "@engine/math/src";
import { Quad, QuadNoCollider } from "@engine/prefabs/quad.prefab";
import GameObject from "@engine/scene/gameobject";
import { vec3 } from "gl-matrix";

export class Debug {

    public static log(message: string) {
        console.log(message);
    }

    /**
     * Draws a debug line in the scene.
     *
     * @param start - The starting point of the line as a vec3.
     * @param end - The ending point of the line as a vec3.
     * @param color - The color of the line as a vec3.
     * @param durationS - Optional duration in seconds for which the line should be visible.
     */
    public static line(_start: Vector3, _end: Vector3, color: Color, durationS?: number) {
        const scene = activeScene;
        if (scene) {

            var end = _end.clone();
            end.z = -10;


            var start = _start.clone();
            start.z = -10;

            const lineQuad = QuadNoCollider(scene, color);

            const dist = start.distanceTo(end);
            lineQuad!.transform.scale.set(0.02, dist, 1.0);

            // move it up by half the distance
            lineQuad!.transform.position.set(
                0,
                dist / 2,
                0
            );

            // // create a pivot point at the start
            const emptyPivot = new GameObject("emptyPivot", scene);
            emptyPivot.add_child(lineQuad);

            emptyPivot.transform.position.set(start.x, start.y, start.z);

            // find degrees between the two points
            const angle = Math.atan2(end.x - start.x, end.y - start.y);
            emptyPivot.transform.rotation = new Euler(0, 0, -angle);

            const expire = async () => {
                if (durationS) {
                    await scene.seconds(durationS);
                }
                else {
                    await scene.tick();
                }
                emptyPivot.destroy();
            };

            expire();

        }
    }
}
