import Scene from "./";
import GameObject from "./gameobject";
import TransformComponent from "./core/transform_component";
import Collider from "./core/collider_component";
export default class Component {
    protected _scene: Scene;
    protected _gameObject: GameObject;
    protected _transform: TransformComponent;
    started: boolean;
    constructor();
    attach(gameObject: GameObject): void;
    get scene(): Scene;
    get gameObject(): GameObject;
    get transform(): TransformComponent;
    awake(): void;
    start(): void;
    update(dT: number): void;
    mouseEvent(type: number, button: number): void;
    inputEvent(type: number, key: string): void;
    destroy(): void;
    on_collision(collider: Collider): void;
}
