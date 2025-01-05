import Component from "@engine/scene/component";
import { mat4, vec3, vec4 } from "gl-matrix";
import computeShaderCode from "./shaders/compute.wgsl";
import BoidMaterial from "./boid_material";
import {Boid} from "./boid";
import Compute from "@engine/ts-compute/compute";
import { shaderProperty, ShaderTypes } from "@engine/ts-compute/datatypes";


interface BoidInitData {
  position: vec3;
  speed: number;
}

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


// This will be responsible for storing boid data & running compute pipeline
// Updating boid data & setting boid data should be done in the BoidRunnerComponent
export default class BoidSystemComponent extends Component {

  public instanceCount: number = 0;
  public maxInstanceCount: number = 3000;

  public boids: BoidData[] = [];
  public boidObjects: BoidObjectData[] = [];
  public boidRefs: Boid[] = [];

  private compute: Compute;
  
  constructor() {
    super();

    this.compute = new Compute([computeShaderCode], [
      "avoidanceMain",
      "movementMain"
    ]);
   
    this.compute.addBuffer<BoidObjectData>({
      name: "objects",
      isArray: true,
      type: BoidObjectData,
      uniform: false,
      defaultValue: [],
      maxInstanceCount:  this.maxInstanceCount
    })

    this.compute.addBuffer<BoidData>({
      name: "boids",
      isArray: true,
      type: BoidData,
      uniform: false,
      defaultValue: [],
      maxInstanceCount: this.maxInstanceCount
    });


    this.compute.addBuffer<number>({
      name: "time",
      uniform: true,
      isArray: false,
      type: ShaderTypes.i32,
      defaultValue: 0,
    })

    this.compute.addBuffer<number>({
      name: "dT",
      uniform: true,
      isArray: false,
      type: ShaderTypes.f32,
      defaultValue: 0,
    });

    this.compute.addBuffer<number>({
      name: "numBoids",
      uniform: true,
      isArray: false,
      type: ShaderTypes.i32,
      defaultValue: 0,
    })

    this.compute.init();
  }

  public async updateBoidInformation () : Promise<void> {

    const boidData = this.compute.getBuffer<BoidData>("boids");
    const objectData = this.compute.getBuffer<BoidObjectData>("objects");

    if (!boidData || !objectData) {
      console.error("Boid data not initialized");
      return;
    }

    const boidInfo = await boidData.readTo(this.instanceCount);
    if (boidInfo != null) this.boids = boidInfo;

    const objectInfo = await objectData.readTo(this.instanceCount);
    if (objectInfo != null) this.boidObjects = objectInfo;
  }

  private warned: boolean = false;
  public addBoid(init: BoidInitData): Boid | undefined{

    if (this.instanceCount >= this.maxInstanceCount) {
      if (!this.warned) {
        this.warned = true;
        console.warn("Max instance count reached");
      }
      return;
    }

    this.compute.setElement<BoidData>("boids", this.instanceCount, {
      targetPosition: [init.position[0], init.position[1], init.position[2], 0],
      avoidanceVector: vec4.create(),
      hasTarget: true,
      speed: init.speed,
    });

    const model = mat4.identity(mat4.create());
    mat4.translate(model, model, init.position);
    mat4.scale(model, model, [0.3, 0.3, 0.3]);

    const position = vec3.clone(init.position);

    this.compute.setElement<BoidObjectData>("objects", this.instanceCount, {
      model,
      position,
    });

    const boid = new Boid(
      this,
      this.instanceCount,
      init.position,
    )

    this.boidRefs.push(boid);

    this.instanceCount++;

    this.compute.set("numBoids", this.instanceCount);


    return boid;
  }

  public setBoidPosition(index: number, position: vec3): void {
    if (index >= this.instanceCount) {
      console.error("Index out of bounds", index, this.instanceCount);
      return;
    }

    const model = mat4.create();
    mat4.translate(model, model, position);
    mat4.scale(model, model, [0.3, 0.3, 0.3]);

    this.compute.setElement<BoidObjectData>("objects", index, {
      model,
      position,
    });

  
  }

  public get objectBuffer () : GPUBuffer {
    return this.compute.getBuffer<BoidObjectData>("objects")!.gpuBuffer as GPUBuffer;
  }

  public setBoidTarget(index: number, target: vec3): void {
    if (index >= this.instanceCount) {
      console.error("Index out of bounds", index, this.instanceCount);
      return;
    }

    this.compute.setElement<BoidData>("boids", index, {
      targetPosition: [target[0], target[1], target[2], 0],
      avoidanceVector: vec4.create(),
      hasTarget: true,
      speed: 1,
    });
  }

  public awake(): void {}

  public update(dT: number): void {
    if (this.compute.ready) {

      const sDT = dT / 1000;

      this.compute.set("time", this.scene.sceneTime / 1000);
      this.compute.set("dT", sDT * 4.0);
      this.compute.set("numBoids", this.instanceCount);

      this.compute.dispatch(Math.ceil(this.instanceCount / 64));
      
      // [ ~~ Update Boid Information ~~ ]
      this.updateBoidInformation(); 

      if (this.gameObject.mesh?.material)
        (this.gameObject.mesh?.material as BoidMaterial).instanceCount =
          this.instanceCount;
    }
  }
}
