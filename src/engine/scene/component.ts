import Scene from "@engine/scene";
import GameObject from "./gameobject";
import TransformComponent from "./core/transform_component";

export default class Component {

  protected _scene!: Scene;
  protected _gameObject!: GameObject;
  protected _transform!: TransformComponent;
  
  constructor() {
  }

  // Called by the GameObject
  public attach (gameObject: GameObject) {
    this._gameObject = gameObject;
    this._scene = gameObject.scene;
    this._transform = gameObject.transform;
  }

  public get scene() : Scene {
    return this._scene;
  }

  public get gameObject() : GameObject {
    return this._gameObject;
  }

  public get transform() : TransformComponent {
    return this._transform;
  }

  public awake() {
  }

  public update(dT: number) {
  }

  public mouseEvent(type: number, button: number) {
  }

  public inputEvent(type: number, key: number) {
  }

  public destroy() {
  }

}
