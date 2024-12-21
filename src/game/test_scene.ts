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
    mat4.translate(model, model, [0.0, 0.0, -20.0]);
    mat4.scale(model, model, [0.1, 0.1, 1.0]);


    this.quadMesh.transform = model;

   

    const simpleMaterial = new StandardDiffuseMaterial("quadMaterial", this); // auto add to scene
    simpleMaterial.textureUrl = "dist/guy-2.png";

    this.registerMaterial(simpleMaterial);

    this.quadMesh.setMaterial(simpleMaterial);

    for (let i = 0; i < 10; i++) {
      const mesh = new QuadMesh(`quad_mesh_${i}`, this); // auto add to scene

      const model = mat4.create();
      mat4.translate(model, model, [Math.random() * 5 - 2.5, Math.random() * 5 - 2.5, -20.0]);
      mat4.scale(model, model, [0.1, 0.1, 1.0]);

      mesh.transform = model;
      mesh.setMaterial(simpleMaterial);
    }
  }

  render(dT: number): void {
    super.render(dT);

    //Example: this.quadMesh.transform = mat4.scale(this.quadMesh.transform, this.quadMesh.transform, [1.01, 1.01, 1.0]);
    this.meshes.forEach((mesh, i) => {

      // psuedo random rotation
      let rotation = Math.sin(i % 3.234) * 0.1;

      mesh.transform = mat4.rotate(mesh.transform, mesh.transform, rotation, [0, 0, 1]);
    });
  }

}