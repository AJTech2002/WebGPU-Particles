//@esline-disable

import Compute from "@engine/ts-compute/compute";
import MainBoidComputeShader from "./shaders/compute.wgsl";
import BoidCollisionShader from "./shaders/collisions.wgsl";
import {mat4, vec4} from "gl-matrix";
import { shaderBuffer, shaderProperty, StorageMode, ShaderTypes } from "@engine/ts-compute/datatypes";
import Collider from "@engine/scene/core/collider_component"; 


export class BoidData {
  @shaderProperty(ShaderTypes.vec4)
  public targetPosition: vec4 = [0,0,0,0]; // bytes: 16

  @shaderProperty(ShaderTypes.vec4)
  public avoidanceVector: vec4 = [0,0,0,0]; // bytes: 16

  @shaderProperty(ShaderTypes.u32)
  public hasTarget: boolean = false; // bytes: 4

  @shaderProperty(ShaderTypes.f32)
  public speed: number = 0.0; // bytes: 4
}

export class BoidObjectData {
  @shaderProperty(ShaderTypes.mat4x4)
  public model: mat4 = mat4.create();

  @shaderProperty(ShaderTypes.vec3)
  public position: vec3 = [0,0,0];
}

export const maxInstanceCount = 3000;

export class BoidCompute extends Compute {

  @shaderBuffer(BoidObjectData, StorageMode.read_write, [], maxInstanceCount) 
  private objects: BoidObjectData[];

  @shaderBuffer(BoidData, StorageMode.read_write, [], maxInstanceCount)
  private boids: BoidData[];

  @shaderBuffer(Collider, StorageMode.write, [], 100)
  private colliders: Collider[];

  @shaderBuffer("f32", StorageMode.uniform, 100)
  private gridWidth: number;
  
  @shaderBuffer("f32", StorageMode.uniform, 0)
  private time: number;

  @shaderBuffer("f32", StorageMode.uniform, 0)
  private dT: number;

  @shaderBuffer("f32", StorageMode.uniform, 0)
  private numBoids: number;

  @shaderBuffer("f32", StorageMode.uniform, 0)
  private numColliders: number;

  constructor() {
    super(
      [MainBoidComputeShader, BoidCollisionShader],
      [
        "avoidanceMain",
        "movementMain",
        "collisionMain"
      ]
    );
  }


  public set Time (time: number) {
    this.set("time", time);
  }

  public set DeltaTime (dt: number) {
    this.set("dT", dt);
  }

  public set NumBoids (num: number) {
    this.set("numBoids", num);
  }

  public set NumColliders (num: number) {
    this.set("numColliders", num);
  }

}
