//@esline-disable

import Compute from "@engine/ts-compute/compute";
import MainBoidComputeShader from "./shaders/compute.wgsl";
import BoidCollisionShader from "./shaders/collisions.wgsl";
import {mat4, vec3, vec4} from "gl-matrix";
import { shaderBuffer, shaderStruct, shaderProperty, StorageMode, ShaderTypes } from "@engine/ts-compute/datatypes";
import Collider from "@engine/scene/core/collider_component"; 

//TODO: These can be split 
@shaderStruct("BoidData")
export class BoidInputData {
  @shaderProperty(ShaderTypes.vec4)
  public targetPosition: vec4 = [0,0,0,0]; // bytes: 16

  @shaderProperty(ShaderTypes.vec4)
  public externalForce: vec4 = [0,0,0,0]; // bytes: 16

  @shaderProperty(ShaderTypes.vec4)
  public diffuseColor: vec4 = [0,0,0,0]; // bytes: 16

  @shaderProperty(ShaderTypes.bool)
  public hasTarget: boolean = false; // bytes: 4

  @shaderProperty(ShaderTypes.f32)
  public speed: number = 0.0; // bytes: 4

  @shaderProperty(ShaderTypes.f32)
  public steeringSpeed: number = 0.0; // bytes: 4

  @shaderProperty(ShaderTypes.f32)
  public scale: number = 0.0; // bytes: 4

  @shaderProperty(ShaderTypes.bool)
  public alive: boolean = true; // bytes: 4
}

@shaderStruct("BoidGPUData")
export class BoidGPUData {
  @shaderProperty(ShaderTypes.vec4)
  public avoidanceVector: vec4 = [0,0,0,0]; // bytes: 16

  @shaderProperty(ShaderTypes.vec4)
  public collisionVector: vec4 = [0,0,0,0]; // bytes: 16

  @shaderProperty(ShaderTypes.vec4)
  public externalForce: vec4 = [0,0,0,0]; // bytes: 16

  @shaderProperty(ShaderTypes.vec4)
  public lastModelPosition: vec4 = [0,0,0,0]; // bytes: 16

  @shaderProperty(ShaderTypes.vec4)
  public steering: vec4 = [0,0,0,0]; // bytes: 16

  @shaderProperty(ShaderTypes.vec4)
  public position: vec4 = [0,0,0,0]; // bytes: 16
}

@shaderStruct("BoidObjectData")
export class BoidObjectData {
  @shaderProperty(ShaderTypes.mat4x4)
  public model: mat4 = mat4.create();

  @shaderProperty(ShaderTypes.vec4)
  public diffuseColor: vec4 = [0,0,0,0];

  @shaderProperty(ShaderTypes.u32)
  public hash: number = 0;

  @shaderProperty(ShaderTypes.u32)
  public boidId: number = 0; // bytes: vec4

  @shaderProperty(ShaderTypes.bool)
  public visible: boolean = true; // bytes: 4
}

@shaderStruct("BoidOutputData")
export class BoidOutputData {
  @shaderProperty(ShaderTypes.vec3)
  public position: vec3 = [0,0,0];
}

export const maxInstanceCount = 64 * 20; // = 1280

export class BoidCompute extends Compute {

  @shaderBuffer(BoidObjectData, StorageMode.read_write, [], maxInstanceCount) 
  private objects!: BoidObjectData[];

  @shaderBuffer(BoidInputData, StorageMode.read_write, [], maxInstanceCount)
  private boid_input!: BoidInputData[];

  @shaderBuffer(BoidGPUData, StorageMode.read_write, [], maxInstanceCount)
  private boids!: BoidGPUData[];

  @shaderBuffer(BoidOutputData, StorageMode.read_write, [], maxInstanceCount)
  private boid_output!: BoidOutputData[];

  @shaderBuffer(Collider, StorageMode.write, [], 100)
  private colliders!: Collider[];

  @shaderBuffer("f32", StorageMode.uniform, 100)
  private gridWidth!: number;
  
  @shaderBuffer("f32", StorageMode.uniform, 0)
  private time!: number;

  @shaderBuffer("f32", StorageMode.uniform, 0)
  private dT!: number;

  @shaderBuffer("f32", StorageMode.uniform, 0)
  private numBoids!: number;

  @shaderBuffer("f32", StorageMode.uniform, 0)
  private numColliders!: number;

  constructor() {
    super(
      [MainBoidComputeShader, BoidCollisionShader],
      [
        "collisionMain",
        "avoidanceMain",
        "movementMain",
      ]
    );
    
  }

  init(): void {
    super.init();
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
