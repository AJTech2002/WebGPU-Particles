import { Vector3 } from "@math";
import { QuadMesh } from "@engine/scene/core/mesh_component";
import { StandardDiffuseMaterial, StandardMaterial } from "@engine/renderer/material";
import Scene from "@engine/scene";
import GameObject from "@engine/scene/gameobject";
import { mat4 } from "gl-matrix";

export default class TestScene extends Scene {

  private quadMesh!: QuadMesh;

  start(): void {
    const testGameObject = new GameObject("test_guy", this);
    testGameObject.addComponent(new QuadMesh(
      new StandardDiffuseMaterial(this, "dist/guy-2.png")
    )) // add mesh
    // testGameObject.transform.position.z = -20;

    testGameObject.transform.position.x = 1;

    this.activeCamera!.gameObject.transform.position.z = -10;
    
    testGameObject.transform.localRotateOnAxis(new Vector3(0,0,1), 1);
  }

  render(dT: number): void {
    super.render(dT);
    this.gameObjects.forEach((gameObject) => {
      // gameObject.transform.localRotateOnAxis(new Vector3(0,0,1), 0.001);
    });

    // this.activeCamera?.gameObject.transform.rotateOnAxis(new Vector3(0,1,0), 0.01);

  }

}