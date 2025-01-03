import { mat4, vec4 } from "gl-matrix";
import { Renderer } from "@renderer/renderer";
import Mesh from "./scene/core/mesh_component";
import Engine from "./engine";
import Material from "./renderer/material";
import GameObject from "./scene/gameobject";
import CameraComponent from "./scene/core/camera_component";
import Input from "./scene/inputs";

export interface CameraData {
  view: mat4;
  projection: mat4;
  transform: mat4;
  leftRightBottomTop: vec4;
}

export default class  Scene {

  protected _engine!: Engine;
  
  protected _materials: Material[] = [];
  protected _gameObjects: GameObject[] = [];
  
  protected time: number = 0;

  protected cameraObject: GameObject;

  protected input : Input;

  constructor() {
    this.cameraObject = new GameObject("MainCamera", this);
    this.cameraObject.addComponent(new CameraComponent());
    this.input = new Input(this);
  }

  //#region Scene Graph Elements
  public get activeCamera() : CameraComponent | null {
    return this.cameraObject.getComponent(CameraComponent);
  }

  public get materials() {
    return this._materials;
  }

  public get engine() {
    return this._engine;
  }

  public get renderer() {
    return this._engine.renderer;
  }

  public get inputSystem() : Input {
    return this.input;
  }

  public registerMaterial(material: Material) {
    if (this._materials.indexOf(material) > -1) {
      return;
    }

    this._materials.push(material);
    material.start(this.engine);
  }
  //#endregion

  //#region GameObjects
  public addGameObject(gameObject: GameObject) {
    this._gameObjects.push(gameObject);
    gameObject.on_awake();
  }

  public removeGameObject(gameObject: GameObject) {
    gameObject.on_destroy();
    const index = this._gameObjects.indexOf(gameObject);
    if (index > -1) {
      this._gameObjects.splice(index, 1);
    }
  }

  public findGameObject(name: string) {
    for (let i = 0; i < this._gameObjects.length; i++) {
      if (this._gameObjects[i].name === name) {
        return this._gameObjects[i];
      }
    }
    return null;
  }

  public get gameObjects() {
    return this._gameObjects;
  }

  public get sceneTime() {
    return this.time;
  }
  //#endregion

  render (dT: number) {
    this.time += dT;

    for (let i = 0; i < this._gameObjects.length; i++) {
      this._gameObjects[i].on_update(dT);
    }
  }

  awake (engine: Engine) {
    this._engine = engine;
    this.input.setup();
  }

  start () {
    // to override
  }

  inputEvent(type: number, key: string) {
    // to override  
    for (let i = 0; i < this._gameObjects.length; i++) {
      this._gameObjects[i].inputEvent(type, key);
    }
  }

  mouseEvent(type: number, button: number) {
    // to override
    for (let i = 0; i < this._gameObjects.length; i++) {
      this._gameObjects[i].mouseEvent(type, button);
    }
  }
  
  dispose() {
    for (let i = 0; i < this._gameObjects.length; i++) {
      this._gameObjects[i].on_destroy();
    }

    for (let i = 0; i < this._materials.length; i++) {
      this._materials[i].dispose();
    }

    this._gameObjects = [];
    this._materials = [];

    this.input.dispose();
  }

}
