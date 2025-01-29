import { StandardDiffuseMaterial } from "../../../engine/renderer/material";
import Scene from "../../../engine/scene";
export default class BoidMaterial extends StandardDiffuseMaterial {
    private buffer;
    constructor(scene: Scene, objectBuffer: GPUBuffer, url?: string);
    setupUniforms(): void;
}
