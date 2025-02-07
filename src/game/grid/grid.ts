import Scene from "@engine/scene";
import GameObject from "@engine/scene/gameobject";
import Component from "@engine/scene/component";
import GridTexture from "../../assets/grid.png";
import { StandardDiffuseMaterial } from "@engine/renderer/material";
import { QuadMesh } from "@engine/scene/core/mesh_component";
import { Color, Vector2, Vector3 } from "@engine/math/src";
import { vec3 } from "gl-matrix";

export class GridComponent extends Component { 
  private sizeX = 1;
  private sizeY = 1;
  private cellSize = 1;

  private origin = new Vector3(0, 0, 0);

  constructor(sizeX: number, sizeY: number, cellSize: number) {
    super();
    this.sizeX = sizeX;
    this.sizeY = sizeY;
    this.cellSize = cellSize;
    this.origin = new Vector3(-sizeX / 2, -sizeY / 2, 0);
  }

  public gridTileAt (position: vec3) {

    const relativePosition = new Vector3(position[0] - this.origin.x, position[1] - this.origin.y, 0);

    let x = Math.floor(relativePosition.x /  this.cellSize);
    let y = Math.floor(relativePosition.y / this.cellSize);

    // clamp to the grid
    x = Math.min(this.sizeX - 1, Math.max(0, x));
    y = Math.min(this.sizeY - 1, Math.max(0, y));

    return new Vector2(x, y);
  }

  public hashedTileIndex (x: number, y: number) {
    // hash function to get a unique index for each hashedTileIndex
    return x + y * this.sizeX;
  }

  public getNeighbours (x: number, y: number) {
    const neighbours = [
      {x: x - 1, y: y - 1},
      {x: x, y: y - 1},
      {x: x + 1, y: y - 1},
      {x: x - 1, y: y},
      {x: x + 1, y: y},
      {x: x - 1, y: y + 1},
      {x: x, y: y + 1},
      {x: x + 1, y: y + 1},
      {x: x, y: y} // include self
    ];

    return neighbours.filter((neighbour) => {
      return neighbour.x >= 0 && neighbour.x < this.sizeX && neighbour.y >= 0 && neighbour.y < this.sizeY;
    });
  }

  public getNeighboursMulti (x: number, y: number, radius: number) {
    const neighbours: {
      x: number,
      y: number
    } [] = [];

    for (let i = -radius; i <= radius; i++) {
      for (let j = -radius; j <= radius; j++) {
        if (x + i >= 0 && x + i < this.sizeX && y + j >= 0 && y + j < this.sizeY) {
          neighbours.push({x: x + i, y: y + j});
        }
      }
    }

    return neighbours;
  }

  public get size () {
    return new Vector2(this.sizeX, this.sizeY);
  }

  public get cell_size () {
    return this.cellSize;
  }

  public get center () {
    return this.origin;
  }

}
