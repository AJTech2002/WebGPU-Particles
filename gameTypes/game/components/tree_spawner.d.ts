import Component from "../../engine/scene/component";
import GameObject from "../../engine/scene/gameobject";
export declare class TreeSpawner extends Component {
    private treeCount;
    private grid;
    private treeMaterial;
    trees: GameObject[];
    constructor();
    awake(): void;
    start(): void;
    private createTree;
}
