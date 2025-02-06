import { StandardDiffuseMaterial } from "@engine/renderer/material";
import Scene from "@engine/scene";
import GameObject from "@engine/scene/gameobject";
import { GridComponent } from "@game/grid/grid";
import GridTexture from "../../assets/grid.png";
import { Color, Vector2, Vector3 } from "@engine/math/src";
import { QuadMesh } from "@engine/scene/core/mesh_component";
import { Debug } from "@engine/debug/debug";

export function Grid (
  scene: Scene,
  sizeX: number,
  sizeY: number
) : GameObject {
    const gridObject = new GameObject("grid", scene);
    const grid = new GridComponent(sizeX, sizeY, 1)
    gridObject.addComponent(grid);

    const material = new StandardDiffuseMaterial(scene, GridTexture);
    material.color = new Color(0.9,0.9,0.9);
    material.scale = new Vector2(sizeX * 3, sizeY * 3);

    gridObject.transform.scale.x = sizeX;
    gridObject.transform.scale.y = sizeY;

    gridObject.transform.position.z = -10;

    gridObject.addComponent(new QuadMesh(material));

    const halfX = sizeX / 2;
    const halfY = sizeY / 2;
    
    // draw a line around the grid
    // Debug.line (
    //   new Vector3(-halfX, -halfY, -1),
    //   new Vector3(halfX, -halfY, -1),
    //   new Color(0, 0, 0),
    //   1000
    // )

    // Debug.line (
    //   new Vector3(-halfX, halfY, -1),
    //   new Vector3(halfX, halfY, -1),
    //   new Color(0, 0, 0),
    //   1000
    // )

    // Debug.line (
    //   new Vector3(-halfX, -halfY, -1),
    //   new Vector3(-halfX, halfY, -1),
    //   new Color(0, 0, 0),
    //   1000
    // )

    // Debug.line (
    //   new Vector3(halfX, -halfY, -1),
    //   new Vector3(halfX, halfY, -1),
    //   new Color(0, 0, 0),
    //   1000
    // )

    return gridObject;
}