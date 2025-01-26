import Component from "../../engine/scene/component";
export default class CameraMovement extends Component {
    private middleMouseStart;
    private cameraStartPos;
    private input;
    private activeCamera;
    constructor();
    awake(): void;
    mouseEvent(type: number, button: number): void;
}
