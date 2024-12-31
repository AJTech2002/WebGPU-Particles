import { mat4, vec4 } from "gl-matrix";
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
export default class Scene {
    protected _engine: Engine;
    protected _materials: Material[];
    protected _gameObjects: GameObject[];
    protected time: number;
    protected cameraObject: GameObject;
    protected input: Input;
    constructor();
    get activeCamera(): CameraComponent | null;
    get materials(): Material[];
    get engine(): Engine;
    get renderer(): import("./renderer/renderer").Renderer;
    registerMaterial(material: Material): void;
    addGameObject(gameObject: GameObject): void;
    removeGameObject(gameObject: GameObject): void;
    findGameObject(name: string): GameObject;
    get gameObjects(): GameObject[];
    get sceneTime(): number;
    render(dT: number): void;
    awake(engine: Engine): void;
    start(): void;
    inputEvent(type: number, key: string): void;
    dispose(): void;
}
