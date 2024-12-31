import { mat4, vec4 } from "gl-matrix";
import Component from "@engine/scene/component";
export default class CameraComponent extends Component {
    projection: mat4;
    protected cameraScale: number;
    private leftRightBottomTop;
    constructor();
    get view(): mat4;
    get extents(): vec4;
    private updateCamera;
    update(dT: number): void;
}
