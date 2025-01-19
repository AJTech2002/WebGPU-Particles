import { mat4, vec4 } from "gl-matrix";
import Engine from "./engine";
import Material from "./renderer/material";
import GameObject from "./scene/gameobject";
import CameraComponent from "./scene/core/camera_component";
import Input from "./scene/inputs";
import Component from "./scene/component";

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

  public get gameObjects() {
    return this._gameObjects;
  }

  public get sceneTime() {
    return this.time;
  }
  //#endregion

  public dT: number = 0;
  public frame: number = 0;

  render(dT: number) {

    if (this.disposed) {
      return;
    }

    this.dT = dT;
    this.time += dT;
    this.frame++;

    for (let i = 0; i < this.callbacks.length; i++) {
      this.callbacks[i](dT);
    }

    for (let i = 0; i < this._gameObjects.length; i++) {
      this._gameObjects[i].on_update(dT);
    }
  }

  // render callback (dt) type
  private callbacks: Array<RenderCallback> = [];
  createRenderCallback(callback : RenderCallback) {
    this.callbacks.push(callback);
  }

  removeRenderCallback(callback : RenderCallback) {
    const index = this.callbacks.indexOf(callback);
    if (index > -1) {
      this.callbacks.splice(index, 1);
    }
  }

  awake(engine: Engine) {
    this._engine = engine;
    this.input.setup();
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

  runLoopForSeconds (seconds: number, callback: (dt: number) => void, endCallback?: () => void) {
    const startTime = this.time;
    const endTime = startTime + seconds * 1000;

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
  tick = () =>
    new Promise<void>((resolve) => {
      const f = (dt : number) => {
        resolve();
        this.removeRenderCallback(f);
      };

      this.createRenderCallback(f);
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

      const f = (dt: number) => {
        if (this.time - startTime >= s * 1000) {
          resolve();
          this.removeRenderCallback(f);
        }
      };

      this.createRenderCallback(f);
    });
  //#endregion
}
