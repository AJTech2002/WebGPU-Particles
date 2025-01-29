import Component from "../../engine/scene/component";
import { Vector2, Vector3 } from "../../engine/math/src";
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
    get size(): Vector2;
    get cell_size(): number;
    get center(): Vector3;
}
