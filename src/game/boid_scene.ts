import Engine from "@engine/engine";
import Scene from "@engine/scene";
import GameObject from "@engine/scene/gameobject";
import BoidSystemComponent from "./boids/boid_component";
import Mesh, { QuadMesh } from "@engine/scene/core/mesh_component";
import BoidMaterial from "./boids/boid_material";
import { StandardDiffuseMaterial } from "@engine/renderer/material";
import { Matrix4, Quaternion, Vector3 } from "@math";
import { mat4, vec3 } from "gl-matrix";

export default class BoidScene extends Scene {

  private boidSystem!: BoidSystemComponent;

  awake(engine: Engine): void {
    super.awake(engine);

    const boids = new GameObject("boids", this);

    const boidSystem = new BoidSystemComponent();

    this.boidSystem = boidSystem;

    boids.addComponent(boidSystem);

    boids.addComponent(new QuadMesh(new BoidMaterial(
      this,
      boidSystem.objectData.gpuBuffer,
      "dist/guy-2.png"
    )));

    this.activeCamera!.gameObject.transform.position.z = -10;

    this.boidSystem.addBoid({
      position: vec3.fromValues(0, 0, 0),
      speed: 1
    })
  }

  render(dT: number): void {
    super.render(dT);


    if (this.input.getMouseButton(0) ) {
      if (this.boidSystem.instanceCount >= this.boidSystem.maxInstanceCount) {
        for (let i = 0; i < 2; i++) {
          let randomIndex = Math.floor(Math.random() * this.boidSystem.instanceCount);
          this.boidSystem.setBoidPosition(randomIndex, this.input.mouseToWorld(0).toVec3());
        }
      }
      else {
       for (let i = 0; i < 2; i++) {
        this.boidSystem.addBoid({
          position: this.input.mouseToWorld(0).toVec3(),
          speed: 1
        })
       }
      }
    }

  }

  inputEvent(type: number, key: string): void {
    //
    console.log(type, key);

    if (key === 'a' && type === 1) {
      // console.log(this.boidSystem.boidObjects)
      // const decompose = new Matrix4();
      // decompose.fromArray(this.boidSystem.boidObjects[0].map((v) => v));
      
      // const p = new Vector3();
      // const q = new Quaternion();
      // const s = new Vector3();
      // decompose.decompose(p,q,s);
      // console.log(p, q, s);
    }

  }

}