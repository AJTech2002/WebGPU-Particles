import Engine from "@engine/engine";
import CircleTexture from "../assets/circle.png";
import Scene from "@engine/scene";
import GameObject from "@engine/scene/gameobject";
import BoidSystemComponent from "./boids/boid_system";
import { QuadMesh } from "@engine/scene/core/mesh_component";
import BoidMaterial from "./boids/boid_material";
import {vec3 } from "gl-matrix";
import BoidTexture from "../assets/guy-2.png";
import {Boid} from "./boids/boid";
import CameraMovement from "./components/camera_movement";
import Collider, { ColliderShape } from "@engine/scene/core/collider_component";
import { StandardDiffuseMaterial, StandardMaterial } from "@engine/renderer/material";
import { Color, Vector3 } from "@engine/math/src";
import SquareTexture from "../assets/square.png";

export default class BoidScene extends Scene {

  private boidSystem!: BoidSystemComponent;

  createCollider() {
    const collider = new GameObject("collider", this);
    collider.addComponent(new Collider([0.6, 0.6, 0.6], ColliderShape.Circle, false, false));

    const squareCollider = new GameObject("squareCollider", this);

    squareCollider.addComponent(new Collider([1,1,1], ColliderShape.Square, false, false));

    const mat = new StandardDiffuseMaterial(this, CircleTexture); 
    const squareMat = new StandardDiffuseMaterial(this, SquareTexture);
    
    squareCollider.addComponent(new QuadMesh(squareMat));

    collider.addComponent(new QuadMesh(
      mat
    ))

    mat.color = new Color(1,1,1);
    squareMat.color = new Color(1, 0, 0);

    collider.transform.position.z = -9;
    squareCollider.transform.position.z = -9;
    squareCollider.transform.position.x = 0;
  }

  async spinSquare() {
    while (true) {
      await this.tick();
      // this.findGameObject("collider")!.transform.rotateOnAxis(new Vector3(0,0,1), 0.03);
      //
      //
      const sin = Math.cos(this.time * 0.001) * 2;
      this.findGameObject("collider")!.transform.position.x = sin; 
      this.findGameObject("collider")!.transform.scale = new Vector3(0.75 + sin, 0.75 + sin, 0.75 + sin);
      const v3Pos = new Vector3(-2, sin, -9);

      /*this.findGameObject("squareCollider")!.transform.localRotateOnAxis(
        new Vector3(0,0,1),
        0.03
      );*/

      this.findGameObject("squareCollider")!.transform.rotation.z += 0.03; 

      this.findGameObject("squareCollider")!.transform.position = v3Pos;
    }
  }

  async spawnUnits() {
    while (true) {

      this.boidSystem.addBoid({
        position: this.findGameObject("collider")!.transform.position.toVec3(), 
        speed: 0.6
      });
      await this.seconds(0.05);

    }
  }

  awake(engine: Engine): void {
    super.awake(engine);

    this.createCollider();

    this.spinSquare();

    // Add camera movement 
    this.activeCamera!.gameObject.addComponent(new CameraMovement());

    const boids = new GameObject("boids", this);

    const boidSystem = new BoidSystemComponent();

    this.boidSystem = boidSystem;

    boids.addComponent(boidSystem);

    boids.addComponent(new QuadMesh(new BoidMaterial(
      this,
      boidSystem.objectBuffer,
      BoidTexture
    )));

    this.activeCamera!.gameObject.transform.position.z = -10;
    this.spawnUnits();

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
       for (let i = 0; i < 4; i++) {
        const b = this.boidSystem.addBoid({
          position: this.input.mouseToWorld(0).toVec3(),
          speed: 1.0
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
