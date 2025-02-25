import { mat4, vec4 } from "gl-matrix";
import Engine from "./engine";
import Material from "./renderer/material";
import GameObject from "./scene/gameobject";
import CameraComponent from "./scene/core/camera_component";
import Input from "./scene/inputs";
import Component from "./scene/component";
import { Vector3 } from "./math/src";
import Collider from "./scene/core/collider_component";
import { Physics } from "./physics/physics";
import { GridComponent } from "@game/grid/grid";
import { Grid } from "./prefabs/grid.prefab";

export interface CameraData {
  view: mat4;
  projection: mat4;
  transform: mat4;
  leftRightBottomTop: vec4;
}

declare type RenderCallback = (dt: number) => void;


export default class Scene {
  protected _engine!: Engine;

  protected _materials: Material[] = [];
  protected _gameObjects: GameObject[] = [];

  protected time: number = 0;

  protected cameraObject: GameObject;

  protected input: Input;

  private disposed: boolean = false;

  public grid!: GridComponent;
  public physics!: Physics;

  public timeScale: number = 1.0;

  constructor() {
    this.cameraObject = new GameObject("MainCamera", this);
    this.cameraObject.addComponent(new CameraComponent());
    this.input = new Input(this);

  }

  //#region Scene Graph Elements
  public get activeCamera(): CameraComponent | null {
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

  public get inputSystem(): Input {
    return this.input;
  }

  public registerMaterial(material: Material) {
    if (this._materials.indexOf(material) > -1) {
      return;
    }

    this._materials.push(material);
    material.start(this.engine);
  }

  public raycast(
    start: Vector3,
    direction: Vector3,
    distance: number,
  ): Collider[] {
    throw new Error("Method not implemented.");
  }

  //#endregion


  //#region GameObjects

  private async runStart(gameObject: GameObject) {
    await this.tick();
    gameObject.on_start();
  }

  public addGameObject(gameObject: GameObject) {
    this._gameObjects.push(gameObject);
    gameObject.on_awake();
    this.runStart(gameObject);
  }

  public removeGameObject(gameObject: GameObject) {
    gameObject.on_destroy();
    const index = this._gameObjects.indexOf(gameObject);
    if (index > -1) {
      this._gameObjects.splice(index, 1);
    }

    // and all children
    for (let i = 0; i < gameObject.children.length; i++) {
      this.removeGameObject(gameObject.children[i]);
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

  public findObjectsOfType<T extends Component>(type: new (...args: any[]) => T): T[] {
    const result: T[] = [];
    for (let i = 0; i < this._gameObjects.length; i++) {
      const component = this._gameObjects[i].getComponent(type);
      if (component) {
        result.push(component);
      }
    }
    return result;
  }

  public findObjectOfType<T extends Component>(type: new (...args: any[]) => T): T | null {
    for (let i = 0; i < this._gameObjects.length; i++) {
      const component = this._gameObjects[i].getComponent(type);
      if (component)
        return component;
    }
    return null;
  }

  public appendScene(scene: Scene) {
    for (let i = 0; i < scene.gameObjects.length; i++) {
      this.addGameObject(scene.gameObjects[i]);
    }
  }

  public get gameObjects() {
    return this._gameObjects;
  }

  public get sceneTime() {
    return this.time;
  }

  public get sceneTimeSeconds() {
    return this.time;
  }
  //#endregion

  public dT: number = 0;
  public frame: number = 0;

  render(dT: number) {

    if (this.disposed) {
      return;
    }

    this.dT = (dT / 1000) * this.timeScale;
    this.time += this.dT;
    this.frame++;


    for (const callback of this.callbacks) {

      callback(this.dT);

    }

    for (let i = 0; i < this._gameObjects.length; i++) {
      this._gameObjects[i].on_update(this.dT);
    }

    if (this.physics) this.physics.update(this.dT);

    for (const callback of this.postFrameCallbacks) {
      callback(this.dT);
    }
  }

  // render callback (dt) type
  private callbacks: Set<RenderCallback> = new Set();
  private postFrameCallbacks: Set<RenderCallback> = new Set();

  createRenderCallback(callback: RenderCallback) {
    this.callbacks.add(callback);
  }

  createPostFrameCallback(callback: RenderCallback) {
    this.postFrameCallbacks.add(callback);
  }


  removeRenderCallback(callback: RenderCallback) {
    this.callbacks.delete(callback);
  }

  removePostFrameCallback(callback: RenderCallback) {
    this.postFrameCallbacks.delete(callback);
  }

  awake(engine: Engine) {
    this._engine = engine;
    this.input.setup();
    this.grid = Grid(this, 7, 7).getComponent<GridComponent>(GridComponent)!;
    this.physics = new Physics(this, this.grid);
  }

  start() {
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

    this.disposed = true;

    this._gameObjects = [];
    this._materials = [];

    this.input.dispose();
  }

  runLoopForSeconds(seconds: number, callback: (dt: number) => void, endCallback?: () => void) {
    const startTime = this.time;
    const endTime = startTime + seconds;

    const f = (dt: number) => {
      if (this.time >= endTime) {
        this.removeRenderCallback(f);
        if (endCallback) {
          endCallback();
        }
      }
      callback(dt);
    };

    this.createRenderCallback(f);
  }

  //#region Coroutine Support
  /**
   * Wait for the next game tick
   * @returns Awaitable Promise
   * @example `await gameManager.tick();`
   */
  tick = (post: boolean = false) =>
    new Promise<void>((resolve) => {
      const f = (dt: number) => {
        resolve();
        if (post) {
          this.removePostFrameCallback(f);
        }
        else {
          this.removeRenderCallback(f);
        }
      };

      if (post) {
        this.createPostFrameCallback(f);
      } else {
        this.createRenderCallback(f);
      }
    });

  /**
   * Wait until a condition is met
   * @param condition The condition to wait for
   * @returns Awaitable Promise
   */
  until = (condition: () => boolean) =>
    new Promise<void>((resolve) => {
      const f = (dt: number) => {
        if (condition()) {
          resolve();
          this.removeRenderCallback(f);
        }
      };

      this.createRenderCallback(f);
    });

  /**
   * Wait for the next n seconds
   * @param s Number of seconds to wait
   * @returns Awaitable Promise
   * @example `await gameManager.seconds(5);`
   */
  seconds = (s: number) =>
    new Promise<void>((resolve) => {
      const startTime = this.time;

      setTimeout(async () => {
        await this.tick();
        resolve();
      }, s * 1000);
    });

  protected async reportFPS() {
    while (true) {
      await this.seconds(2);
      console.log("FPS: ", 1.0 / (this.dT));
    }
  }

  //#endregion
}
