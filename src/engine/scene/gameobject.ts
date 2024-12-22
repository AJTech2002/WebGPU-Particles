import Scene from "@engine/scene";
import Component from "./component";
import TransformComponent from "./core/transform_component";

export default class GameObject {

  public name: string = "GameObject";

  private _scene: Scene;
  private _components: Component[] = [];
  
  // GameObject must have a transform component
  private _transform : TransformComponent;
  
  private _parent: GameObject | null = null;
  private _children: GameObject[] = [];

  private instantiated: boolean = false;

  constructor (name: string, scene: Scene) {
    this.name = name;
    this._scene = scene;
    this._transform = new TransformComponent();
    this.add_component(this._transform);
    this.scene.addGameObject(this);
  }

  //#region Core Accessors
  public get transform () {
    return this._transform;
  }

  public get scene() {  
    return this._scene;
  }

  public get parent() {
    return this._parent;
  }

  public get children() {
    return this._children;
  }

  public set parent (parent: GameObject | null) {
    if (this._parent) this._parent.remove_child(this);
    if (parent) parent.add_child(this);
    this._parent = parent;
  }
  
  public add_child(child: GameObject) {
    this._children.push(child);
    child._parent = this;
  }
  
  public remove_child(child: GameObject) {
    const index = this._children.indexOf(child);
    if (index > -1) {
      this._children.splice(index, 1);
    }
  }
  //#endregion

  //#region Lifecycle Methods
  public on_awake() {
    console.log("Awake", this.name, this._components.length);
    for (let i = 0; i < this._components.length; i++) this._components[i].awake();
    this.instantiated = true;
  }

  public on_update(dt: number) {
    for (let i = 0; i < this._components.length; i++) this._components[i].update(dt);
  }

  public on_destroy() {
    for (let i = 0; i < this._components.length; i++) this._components[i].destroy();
  }

  public destroy() {
    this._scene.removeGameObject(this);
  }

  //#endregion

  //#region Component Management
  public add_component(component: Component) {
    this._components.push(component);
    component.attach(this);
    if (this.instantiated) component.awake();
    console.log("Component added", this.name, this._components.length, this.instantiated);
  }

  public get_component<T extends Component>(type: new(gameObject: GameObject) => T) {
    for (let i = 0; i < this._components.length; i++) {
      if (this._components[i] instanceof type) {
        return this._components[i] as T;
      }
    }
    return null;
  }

  public remove_component(component: Component) {
    const index = this._components.indexOf(component);
    if (index > -1) {
      this._components.splice(index, 1);
    }
  }

  //#endregion
}