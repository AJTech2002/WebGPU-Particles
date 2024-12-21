import { QuadMesh } from "@engine/mesh/mesh";
import { StandardDiffuseMaterial, StandardMaterial } from "@engine/renderer/material";
import Scene from "@engine/scene";
import { mat4 } from "gl-matrix";

export default class TestScene extends Scene {

  private quadMesh!: QuadMesh;

  start(): void {
    this.quadMesh = new QuadMesh("quad_mesh", this); // auto add to scene

    console.log(this.quadMesh.getVertexCount());

    const model = mat4.create();
    
    mat4.translate(model, model, [0.5, 0.5, -20.0]);
    mat4.scale(model, model, [0.1, 0.1, 1.0]);

    this.quadMesh.transform = model;

    const simpleMaterial = new StandardDiffuseMaterial("quadMaterial", this); // auto add to scene
    simpleMaterial.textureUrl = "dist/guy-2.png";

    this.registerMaterial(simpleMaterial);

    this.quadMesh.setMaterial(simpleMaterial);
  }

  render(dT: number): void {
    super.render(dT);

    //Example: this.quadMesh.transform = mat4.scale(this.quadMesh.transform, this.quadMesh.transform, [1.01, 1.01, 1.0]);

  }

}