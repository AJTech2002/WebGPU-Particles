import { StandardDiffuseMaterial } from "../../../engine/renderer/material";
import Scene from "../../../engine/scene";
import { Color } from "../../../engine/math/src";
export default class OutlineMaterial extends StandardDiffuseMaterial {
    private _outlineWidth;
    constructor(scene: Scene, outlineWidth: number, outlineColor: Color, alphaMask: string);
    set outlineWidth(width: number);
    get outlineWidth(): number;
    setupUniforms(): void;
}
