import { Color, Vector3 } from "@math";
import { QuadMesh } from "@engine/scene/core/mesh_component";
import { StandardDiffuseMaterial, StandardMaterial } from "@engine/renderer/material";
import Scene from "@engine/scene";
import GameObject from "@engine/scene/gameobject";
import { mat4 } from "gl-matrix";

import TEST_TEXTURE from "../assets/logo.png";
import CameraMovement from "./components/camera_movement";

export default class TestScene extends Scene {

  private quadMesh!: QuadMesh;

  start(): void {

    super.start();

    this.activeCamera!.gameObject.addComponent(
      new CameraMovement()
    )

    const testGameObject = new GameObject("test_guy", this);
    testGameObject.addComponent(new QuadMesh(
      new StandardDiffuseMaterial(this, TEST_TEXTURE)
      // new StandardMaterial(this)
    )) // add mesh
    // testGameObject.transform.position.z = -20;

    testGameObject.transform.position.x = 0;
    testGameObject.transform.position.z = -20;

    // this.activeCamera!.gameObject.transform.position.z = -100;
    
    testGameObject.transform.localRotateOnAxis(new Vector3(0,0,1), 1);
  }

  render(dT: number): void {
    super.render(dT);
    this.gameObjects.forEach((gameObject) => {
      // gameObject.transform.localRotateOnAxis(new Vector3(0,0,1), 0.001);
    });

    // this.activeCamera?.gameObject.transform.rotateOnAxis(new Vector3(0,1,0), 0.01);
    this.findGameObject("test_guy")?.transform.localRotateOnAxis(new Vector3(0,0,1), 0.01);
    (this.findGameObject("test_guy")?.mesh?.material as StandardDiffuseMaterial).colorUniform.value = new Color(Math.sin(this.time*0.01), Math.cos(this.time*0.01), 0);

    this.activeCamera
  }

}
