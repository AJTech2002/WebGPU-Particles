import Engine from "@engine/engine";
import Scene from "@engine/scene";
import GameObject from "@engine/scene/gameobject";
import BoidSystemComponent from "./boids/boid_component";
import Mesh, { QuadMesh } from "@engine/scene/core/mesh_component";
import BoidMaterial from "./boids/boid_material";
import { StandardDiffuseMaterial } from "@engine/renderer/material";
import { Vector3 } from "@math";

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
    
    boidSystem.addBoid({
      position: [0, 0, 0],
      speed: 1
    })


    this.boidSystem.addBoid({
      position: [.1, 0, 0],
      speed: 1
    })

    this.boidSystem.addBoid({
      position: [.2, 0, 0],
      speed: 1
    })

    this.activeCamera!.gameObject.transform.position.z = -10;

  }

  render(dT: number): void {
    super.render(dT);
    this.boidSystem.addBoid({
      position: [Math.random() * 2 - 1, Math.random() * 2 - 1, 0],
      speed: 1
    })

    this.gameObjects[1].transform.localRotateOnAxis(new Vector3(0, 0, 1), 0.01);
  }

}