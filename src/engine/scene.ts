import { mat4, vec4 } from "gl-matrix";
import { Renderer } from "@renderer/renderer";
import Mesh from "./mesh/mesh";
import Engine from "./engine";
import Material from "./renderer/material";
import GameObject from "./scene/gameobject";

export interface CameraData {
  view: mat4;
  projection: mat4;
  transform: mat4;
  leftRightBottomTop: vec4;
}

export default class  Scene {

  protected cameraData: CameraData;
  protected cameraScale: number = 200;
  protected _engine!: Engine;
  
  protected _materials: Material[] = [];
  protected _gameObjects: GameObject[] = [];
  
  protected time: number = 0;

  constructor() {
    this.cameraData = {
      view: mat4.create(),
      projection: mat4.create(),
      transform: mat4.create(),
      leftRightBottomTop: [-8, 8, -6, 6],
    }

    this.cameraData.projection = mat4.create();

    this.updateCamera();

    // add a callback for window size and change camera
    window.addEventListener("resize", () => {
      this.updateCamera();
    });

    // listen for zoom events and change scaling
    window.addEventListener("wheel", (e) => {
      if (e.deltaY > 0) {
        this.cameraScale += 5;
      } else {
        this.cameraScale -= 5;
      }

      this.updateCamera();
    });
    
  }

  //#region Scene Graph Elements
  public get activeCamera() {
    return this.cameraData;
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

  private updateCamera() {
    var windowWidth = window.innerWidth/this.cameraScale;
    var windowHeight = window.innerHeight/this.cameraScale;

    this.cameraData.leftRightBottomTop = [-windowWidth, windowWidth, -windowHeight, windowHeight];
    mat4.ortho(this.cameraData.projection ,-windowWidth, windowWidth, -windowHeight, windowHeight, 0, 20);
  }

  public registerMaterial(material: Material) {
    if (this._materials.indexOf(material) > -1) {
      return;
    }

    this._materials.push(material);
    material.start();
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

  public get gameObjects() {
    return this._gameObjects;
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
  }

  start () {
    // to override
  }

}