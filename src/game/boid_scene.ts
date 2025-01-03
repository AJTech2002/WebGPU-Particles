import Engine from "@engine/engine";
import Scene from "@engine/scene";
import GameObject from "@engine/scene/gameobject";
import BoidSystemComponent from "./boids/boid_component";
import { QuadMesh } from "@engine/scene/core/mesh_component";
import BoidMaterial from "./boids/boid_material";
import {vec3 } from "gl-matrix";

import BoidTexture from "../assets/guy-2.png";
import {Boid} from "./boids/boid";
import { Vector2, Vector3 } from "@engine/math/src";
import CameraMovement from "./components/camera_movement";

export default class BoidScene extends Scene {

  private boidSystem!: BoidSystemComponent;

  awake(engine: Engine): void {
    super.awake(engine);

    // Add camera movement 
    this.activeCamera!.gameObject.addComponent(new CameraMovement());

    const boids = new GameObject("boids", this);

    const boidSystem = new BoidSystemComponent();

    this.boidSystem = boidSystem;

    boids.addComponent(boidSystem);

    boids.addComponent(new QuadMesh(new BoidMaterial(
      this,
      boidSystem.objectData.gpuBuffer,
      BoidTexture
    )));

    this.activeCamera!.gameObject.transform.position.z = -10;

    this.boidSystem.addBoid({
      position: vec3.fromValues(0, 0, 0),
      speed: 1
    })
  }

  public get units() : Boid[] {
    return this.boidSystem.boidRefs;
  }

  
  render(dT: number): void {
    super.render(dT);

    if (this.input.getMouseButton(0) ) {
      if (this.boidSystem.instanceCount >= this.boidSystem.maxInstanceCount) {
        for (let i = 0; i < 2; i++) {
          const randomIndex = Math.floor(Math.random() * this.boidSystem.instanceCount);
          this.boidSystem.setBoidPosition(randomIndex, this.input.mouseToWorld(0).toVec3());
        }
      }
      else {
       for (let i = 0; i < 1; i++) {
        const b = this.boidSystem.addBoid({
          position: this.input.mouseToWorld(0).toVec3(),
          speed: 1
        });
       }
      }
    }

    for (let i = 0; i < this.boidSystem.instanceCount; i++) {

      if (this.boidSystem.boidObjects[i] == null) continue;
       
      const mouse = this.input.mouseToWorld(0).toVec3();
      const boid = this.boidSystem.boidObjects[i].position;
      const distance = vec3.distance(mouse, boid);
      if (distance < 0) {
        this.boidSystem.setBoidTarget(i, this.input.mouseToWorld(0).toVec3());
      }
    }

  }
}
