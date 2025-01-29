import Scene from "@engine/scene";
import Component from "./component";
import TransformComponent from "./core/transform_component";
import Mesh from "./core/mesh_component";

export default class GameObject {

  public name: string = "GameObject";

  private _scene: Scene;
  private _components: Component[] = [];
  private _updateComponents: Component[] = [];
  
  // GameObject must have a transform component
  private _transform : TransformComponent;
  
  private _parent: GameObject | null = null;
  private _children: GameObject[] = [];

  private instantiated: boolean = false;
  private _active: boolean = true;
  private _started: boolean = false;

  constructor (name: string, scene: Scene) {
    this.name = name;
    this._scene = scene;
    this._transform = new TransformComponent();
    this.addComponent(this._transform);
    this.scene.addGameObject(this);
  }

  //#region Core Accessors
  public get transform () {
    return this._transform;
  }

  public get mesh() : Mesh | null {
    return this.getComponent<Mesh>(Mesh);
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

  public get active() {
    return this._active;
  }

  public get started() {
    return this._started;
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
    if (!this._active) return;
    for (let i = 0; i < this._components.length; i++) this._components[i].awake();
    this.instantiated = true;
  }

  public on_start() {
    if (!this._active) return;
    this._started = true;
    for (let i = 0; i < this._components.length; i++) this._components[i].start();
  }

  public on_update(dt: number) {
    if (!this._active) return;
    for (let i = 0; i < this._updateComponents.length; i++) this._updateComponents[i].update(dt);
  }

  public on_destroy() {
    for (let i = 0; i < this._components.length; i++) this._components[i].destroy();
    this._active = false;
  }

  public destroy() {
    this._scene.removeGameObject(this);
    this._active = false;
  }

  

  //#endregion
  
  //#region Input Events
  public mouseEvent(type: number, button: number) {
    for (let i = 0; i < this._components.length; i++) this._components[i].mouseEvent(type, button);
  }

  public inputEvent(type: number, key: string) {
    for (let i = 0; i < this._components.length; i++) this._components[i].inputEvent(type, key);
  }
  //#endregion
  
  //#region Component Management
  public addComponent(component: Component, needsUpdate: boolean = true) {
    this._components.push(component);
    component.attach(this);
    if (this.instantiated) component.awake();
    if (needsUpdate) this._updateComponents.push(component);
  }

  public getComponent<T extends Component>(type: new (...args: any[]) => T) {
    for (let i = 0; i < this._components.length; i++) {
      if (this._components[i] instanceof type) {
        return this._components[i] as T;
      }
    }
    return null;
  }

  public removeComponent(component: Component) {
    const index = this._components.indexOf(component);
    if (index > -1) {
      this._components.splice(index, 1);
    }

    const updateIndex = this._updateComponents.indexOf(component);
    if (updateIndex > -1) {
      this._updateComponents.splice(updateIndex, 1);
    }
  }

  //#endregion
}
