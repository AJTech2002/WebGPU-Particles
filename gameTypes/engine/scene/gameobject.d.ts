import Scene from "@engine/scene";
import Component from "./component";
import TransformComponent from "./core/transform_component";
import Mesh from "./core/mesh_component";
export default class GameObject {
    name: string;
    private _scene;
    private _components;
    private _transform;
    private _parent;
    private _children;
    private instantiated;
    constructor(name: string, scene: Scene);
    get transform(): TransformComponent;
    get mesh(): Mesh | null;
    get scene(): Scene;
    get parent(): GameObject | null;
    get children(): GameObject[];
    set parent(parent: GameObject | null);
    add_child(child: GameObject): void;
    remove_child(child: GameObject): void;
    on_awake(): void;
    on_update(dt: number): void;
    on_destroy(): void;
    destroy(): void;
    addComponent(component: Component): void;
    getComponent<T extends Component>(type: new () => T): T;
    removeComponent(component: Component): void;
}
