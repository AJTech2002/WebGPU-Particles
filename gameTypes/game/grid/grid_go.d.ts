import Scene from "../../engine/scene";
import Component from "../../engine/scene/component";
import { Vector2 } from "../../engine/math/src";
import { vec3 } from "gl-matrix";
export declare class GridComponent extends Component {
    private sizeX;
    private sizeY;
    private cellSize;
    private origin;
    constructor(sizeX: number, sizeY: number, cellSize: number);
    gridTileAt(position: vec3): Vector2;
    hashedTileIndex(x: number, y: number): number;
    getNeighbours(x: number, y: number): {
        x: number;
        y: number;
    }[];
}
export declare class Grid {
    private gridObject;
    private material;
    private grid;
    constructor(scene: Scene, sizeX: number, sizeY: number);
    get gridComponent(): GridComponent;
}
