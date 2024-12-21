import { mat4, vec4 } from "gl-matrix";
import { Renderer } from "@renderer/renderer";
import Mesh from "./mesh/mesh";
import Engine from "./engine";
import Material from "./renderer/material";

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
  
  // Makeshift scene graph
  protected _meshes: Mesh[] = [];
  protected _materials: Material[] = [];
  
  private time: number = 0;

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

  public get meshes() {
    return this._meshes;
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

  protected registerMaterial(material: Material) {

    console.log("Registering material: " + material.name);
    this._materials.push(material);
    material.start();
  }

  //#endregion

  render (dT: number) {
    this.time += dT;
  }

  awake (engine: Engine) {
    this._engine = engine;
  }

  start () {
    // to override
  }

}