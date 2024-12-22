import Scene from "@engine/scene";
import GameObject from "./gameobject";
import TransformComponent from "./core/transform_component";

export default class Component {

  protected scene!: Scene;
  protected gameObject!: GameObject;
  protected transform!: TransformComponent;
  
  constructor() {
  }

  // Called by the GameObject
  public attach (gameObject: GameObject) {
    this.gameObject = gameObject;
    this.scene = gameObject.scene;
    this.transform = gameObject.transform;
  }

  public awake() {
  }

  public update(dT: number) {
  }

  public destroy() {
  }

}