import Engine from "@engine/engine";
import Scene from "@engine/scene";
import GameObject from "@engine/scene/gameobject";
import BoidSystemComponent from "./boids/boid_component";
import Mesh, { QuadMesh } from "@engine/scene/core/mesh_component";
import BoidMaterial from "./boids/boid_material";
import { StandardDiffuseMaterial } from "@engine/renderer/material";

export default class BoidScene extends Scene {

  awake(engine: Engine): void {
    super.awake(engine);

    const boids = new GameObject("boids", this);

    const boidSystem = new BoidSystemComponent();

    boids.addComponent(boidSystem);

    boids.addComponent(new QuadMesh(new BoidMaterial(
      this,
      boidSystem.objectData,
      "dist/guy-2.png"
    )));

    this.activeCamera!.gameObject.transform.position.z = -10;

  }

}