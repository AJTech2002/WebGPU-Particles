import Scene from "./";
import GameObject from "./gameobject";
import TransformComponent from "./core/transform_component";
export default class Component {
    protected _scene: Scene;
    protected _gameObject: GameObject;
    protected _transform: TransformComponent;
    constructor();
    attach(gameObject: GameObject): void;
    get scene(): Scene;
    get gameObject(): GameObject;
    get transform(): TransformComponent;
    awake(): void;
    update(dT: number): void;
    mouseEvent(type: number, button: number): void;
    inputEvent(type: number, key: string): void;
    destroy(): void;
}
