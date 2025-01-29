import { mat4, vec4 } from "gl-matrix";
import Component from "../component";
export default class CameraComponent extends Component {
    projection: mat4;
    private leftRightBottomTop;
    private cameraScale;
    constructor();
    get view(): mat4;
    get extents(): vec4;
    set scale(value: number);
    get scale(): number;
    private updateCamera;
    update(dT: number): void;
}
