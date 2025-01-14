import Engine from "@engine/engine";
import CircleTexture from "../assets/circle.png";
import Scene from "@engine/scene";
import GameObject from "@engine/scene/gameobject";
import BoidSystemComponent from "./boids/boid_system";
import { QuadMesh } from "@engine/scene/core/mesh_component";
import BoidMaterial from "./boids/rendering/boid_material";
import {vec3 } from "gl-matrix";
import BoidTexture from "../assets/guy-2.png";
import CameraMovement from "./components/camera_movement";
import Collider, { ColliderShape } from "@engine/scene/core/collider_component";
import { StandardDiffuseMaterial } from "@engine/renderer/material";
import { Color, Vector3 } from "@engine/math/src";
import SquareTexture from "../assets/square.png";
import { Grid } from "./grid/grid_go";
import { BoidInterface } from "./boids/interfaces/boid_interface";

export default class BoidScene extends Scene {

  private boidSystem!: BoidSystemComponent;
  private grid!: Grid;

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
      const sin = Math.cos(this.time * 0.001) * 2;
      this.findGameObject("collider")!.transform.position.x = Math.sin(this.time * 0.003) * 5;; 
      this.findGameObject("collider")!.transform.scale = new Vector3(0.75 + sin, 0.75 + sin, 0.75 + sin);

      const v3Pos = new Vector3(-2, sin, -9);
      this.findGameObject("squareCollider")!.transform.rotation.z += 0.03; 
      this.findGameObject("squareCollider")!.transform.scale.x = 1.75 + Math.abs(sin);
      this.findGameObject("squareCollider")!.transform.position = v3Pos;
    }
  }

  async spawnUnits() {
    while (true) {

      await this.seconds(0.05);

    }
  }

  async reportFPS() {
    while (true) {
      await this.seconds(5);
      console.log("FPS: ", (this.dT * 1000/60.0));
    }
  }

  awake(engine: Engine): void {
    super.awake(engine);
    this.reportFPS();

    this.createCollider();
    this.spinSquare();

    

    this.grid = new Grid(this, 50, 50); 

    // Add camera movement 
    this.activeCamera!.gameObject.addComponent(new CameraMovement());

    const boids = new GameObject("boids", this);

    const boidSystem = new BoidSystemComponent(this.grid);

    this.boidSystem = boidSystem;

    boids.addComponent(boidSystem);

    boids.addComponent(new QuadMesh(new BoidMaterial(
      this,
      boidSystem.objectBuffer,
      BoidTexture
    )));

    this.activeCamera!.gameObject.transform.position.z = -10;

    this.boidSystem.addBoid({
      position: [0, 0, 0], 
      speed: 3.0
    });

    this.boidSystem.addBoid({
      position: [1, 0, 0], 
      speed: 3.0
    });


    this.spawnUnits();

  }

  public get units() : BoidInterface[] {
    return this.boidSystem.boidRefs;
  }

  public getUnit (index: number) : BoidInterface {
    if (this.boidSystem.idMappedBoidRefs.has(index)) {
      return this.boidSystem.idMappedBoidRefs.get(index)!;
    }
    else {
      throw new Error(`Unit ${index} not found`);
    }
  }

    
  render(dT: number): void {
    super.render(dT);

    if (this.input.getMouseButton(0) ) {
      if (this.boidSystem.instanceCount >= this.boidSystem.maxInstanceCount) {
        for (let i = 0; i < 2; i++) {
          const randomIndex = Math.floor(Math.random() * this.boidSystem.instanceCount);

          const id = this.boidSystem.boidObjects[randomIndex]?.boidId;

          this.boidSystem.setBoidPosition(id, this.input.mouseToWorld(0).toVec3());
        }
      }
      else {
       for (let i = 0; i < 10; i++) {
         const rV3 = new Vector3(
           Math.random() * 0.2 - 0.1,
           Math.random() * 0.2 - 0.1,
           0
         );

         const b = this.boidSystem.addBoid({
          position: (this.input.mouseToWorld(0).clone().add(rV3)).toVec3(),
          speed: 3.0
        });
        
        if (b)
          this.boidSystem.setUnitColor(b!.boidId);
       }
      }
    }

    for (let i = 0; i < this.boidSystem.instanceCount; i++) {

      if (this.boidSystem.boidObjects[i] == null) continue;
       
      const mouse = this.input.mouseToWorld(0).toVec3();
      if (this.boidSystem.boids[i] == undefined) continue;
      const boid = this.boidSystem.boids[i].position;
      const boidPosition = vec3.fromValues(boid[0], boid[1], boid[2]);
      const distance = vec3.distance(mouse, boidPosition);
      if (distance < 0) {
        this.boidSystem.setBoidTarget(i, this.input.mouseToWorld(0).toVec3());
      }
    }

  }
}
