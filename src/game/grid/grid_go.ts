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

    var relativePosition = new Vector3(position[0] - this.origin.x, position[1] - this.origin.y, 0);

    var x = Math.floor(relativePosition.x /  this.cellSize);
    var y = Math.floor(relativePosition.y / this.cellSize);

    // clamp to the grid
    x = Math.min(this.sizeX - 1, Math.max(0, x));
    y = Math.min(this.sizeY - 1, Math.max(0, y));

    return new Vector2(x, y);
  }

  public hashedTileIndex (x: number, y: number) {
    // hash function to get a unique index for each hashedTileIndex
    return x + y * this.sizeX;
  }

}

export class Grid {

  private gridObject: GameObject;
  private material : StandardDiffuseMaterial;
  private grid : GridComponent;

  constructor(scene: Scene, sizeX: number, sizeY: number) {
    this.gridObject = new GameObject("grid", scene);

    this.grid = new GridComponent(sizeX, sizeY, 1)
    this.gridObject.addComponent(this.grid);

    const material = new StandardDiffuseMaterial(scene, GridTexture);
    this.material = material;

    material.color = new Color(0.9,0.9,0.9);
    material.scale = new Vector2(sizeX * 3, sizeY * 3);

    this.gridObject.transform.scale.x = sizeX;
    this.gridObject.transform.scale.y = sizeY;

    this.gridObject.transform.position.z = -10;

    this.gridObject.addComponent(new QuadMesh(material));
  }

  public get gridComponent() : GridComponent{
    return this.grid;
  }

}
