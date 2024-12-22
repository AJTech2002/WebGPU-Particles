import { Vector3 } from "@math";
import { QuadMesh } from "@engine/mesh/mesh";
import { StandardDiffuseMaterial, StandardMaterial } from "@engine/renderer/material";
import Scene from "@engine/scene";
import GameObject from "@engine/scene/gameobject";
import { mat4 } from "gl-matrix";

export default class TestScene extends Scene {

  private quadMesh!: QuadMesh;

  start(): void {
    const testGameObject = new GameObject("test_guy", this);
    testGameObject.add_component(new QuadMesh(
      new StandardDiffuseMaterial(this, "dist/guy-2.png")
    )) // add mesh
    testGameObject.transform.position.z = -20;


    const object2 = new GameObject("test_guy2", this);
    object2.add_component(new QuadMesh(
      new StandardDiffuseMaterial(this, "dist/guy-2.png")
    )) // add mesh
    object2.transform.position.x = 2;

    object2.parent = testGameObject;

    const object3 = new GameObject("test_guy2", this);
    object3.add_component(new QuadMesh(
      new StandardDiffuseMaterial(this, "dist/guy-2.png")
    )) // add mesh
    object3.transform.position.x = 2;

    object3.transform.scale = new Vector3(0.5, 0.5, 0.5);

    object3.parent = object2;
  }

  render(dT: number): void {
    super.render(dT);
    this.gameObjects.forEach((gameObject) => {
      gameObject.transform.rotateOnAxis(new Vector3(0,0,1), 0.03);
    });
  }

}