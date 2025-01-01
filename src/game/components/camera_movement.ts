import { Vector3 } from "@engine/math/src";
import Component from "@engine/scene/component";
import CameraComponent from "@engine/scene/core/camera_component";
import Input from "@engine/scene/inputs";

export default class CameraMovement extends Component {

  private middleMouseStart: Vector3 = new Vector3();
  private cameraStartPos : Vector3 = new Vector3();

  private input! : Input;
  private activeCamera!: CameraComponent;

  constructor() {
    super();
  }

  public awake(): void {
    this.input = this.scene.inputSystem;
    this.activeCamera = this.scene.activeCamera!;
  }

  override mouseEvent(type: number, button: number): void {
    if (type === 0 && button === 1) {
     this.middleMouseStart = this.input.mouseToWorld(0, false); 
     this.cameraStartPos = this.activeCamera!.gameObject.transform.position.clone();  
    }

    if (type === 2) {
      if (this.input.getMouseButton(1)) {
        const mouse = this.input.mouseToWorld(0, false); 
        const diff = this.middleMouseStart.clone().sub(mouse);

        this.activeCamera!.gameObject.transform.position = this.cameraStartPos.clone().sub(diff);
      }
    }
  }

}
