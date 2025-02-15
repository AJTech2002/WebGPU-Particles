import Component from "../../engine/scene/component";
import GameObject from "../../engine/scene/gameobject";
export declare class HouseSpawner extends Component {
    private houseCount;
    private grid;
    private houseMaterial;
    trees: GameObject[];
    constructor();
    awake(): void;
    start(): void;
    private createHouse;
}
