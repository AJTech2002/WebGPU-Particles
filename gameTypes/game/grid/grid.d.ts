import GameObject from "../../engine/scene/gameobject";
import Component from "../../engine/scene/component";
import { Vector2, Vector3 } from "../../engine/math/src";
import { vec3 } from "gl-matrix";
export declare class GridCell {
    x: number;
    y: number;
    index: number;
    center: Vector3;
    size: number;
    objects: GameObject[];
    constructor(x: number, y: number, index: number, center: Vector3, size: number);
    hasObject(object: GameObject): boolean;
    addObject(object: GameObject): void;
    removeObject(object: GameObject): void;
    hasAnyObjects(): boolean;
}
export declare class GridComponent extends Component {
    private sizeX;
    private sizeY;
    private cellSize;
    private origin;
    gridCells: GridCell[];
    mappedCells: Map<number, GridCell>;
    constructor(sizeX: number, sizeY: number, cellSize: number);
    getGridCellAt(x: number, y: number): GridCell;
    placeAtGridCell(object: GameObject): void;
    canPlaceAtGridCell(object: GameObject): boolean;
    gridTileAt(position: vec3): Vector2;
    hashedTileIndex(x: number, y: number): number;
    getNeighbours(x: number, y: number): {
        x: number;
        y: number;
    }[];
    getNeighboursMulti(x: number, y: number, radius: number): {
        x: number;
        y: number;
    }[];
    get size(): Vector2;
    get cell_size(): number;
    get center(): Vector3;
}
