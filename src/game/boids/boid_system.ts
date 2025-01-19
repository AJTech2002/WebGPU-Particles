import Component from "@engine/scene/component";
import { mat4, vec3, vec4 } from "gl-matrix";
import BoidMaterial from "./rendering/boid_material";
import {BoidInterface} from "./interfaces/boid_interface";
import Collider from "@engine/scene/core/collider_component";
import { BoidCompute, BoidGPUData, BoidInputData, BoidObjectData, BoidOutputData, maxInstanceCount } from "./boid_compute";
import { Grid } from "../grid/grid_go";
import BoidInstance from "./boid_instance";
import GameObject from "@engine/scene/gameobject";
import { Vector3 } from "@engine/math/src";
import { QuickCompute } from "@engine/ts-compute/quick_compute";
import  SwapShader  from "./shaders/swap.wgsl";
import { FloatUniform, UintUniform } from "@engine/renderer/uniforms";
import BoidScene from "../boid_scene";

interface BoidInitData {
  position: vec3;
  speed: number;
  steeringSpeed: number;
}

interface BoidInformation {
  data: BoidOutputData;
}

// This will be responsible for storing boid data & running compute pipeline
// Updating boid data & setting boid data should be done in the BoidRunnerComponent
export default class BoidSystemComponent extends Component {

  //MARK: Properties
  public instanceCount: number = 0;
  public maxInstanceCount: number = maxInstanceCount;

  public boids: BoidInputData[] = [];
  public boidObjects: BoidObjectData[] = [];

  public idMappedBoidData = new Map<number, BoidInformation>();
  
  public idMappedIndex = new Map<number, number>();
  public indexMappedId = new Map<number, number>();

  public idMappedBoidRefs = new Map<number, BoidInstance>();
  public hashMappedBoidRefs = new Map<number, number[]>();
  public boidRefs: BoidInstance[] = [];

  private compute: BoidCompute;
  private warned: boolean = false;

  private grid: Grid; 

  private boidScale: number = 0.3;

  constructor( grid: Grid ) {
    super();
    this.grid = grid;
    this.compute = new BoidCompute();
    this.compute.init();
  }

  public async updateBoidInformation () : Promise<void> {

    const boidOutput = this.compute.getBuffer<BoidOutputData>("boid_output");

    if (!boidOutput) {
      console.error("Boid data not initialized");
      return;
    }

    const output = await boidOutput.readTo(this.instanceCount);

    this.hashMappedBoidRefs.clear();

    //TODO: Remove this and optimize on GPU 
    if (output)
      for (let i = 0; i < output.length; i++) {
        
        const outputData = output[i];
        const boidId = this.indexMappedId.get(i) ?? -1;
        if (boidId == -1 && i < this.instanceCount) {
          console.warn("Boid Index not found", i);
          continue;
        }

        const tile = this.grid.gridComponent.gridTileAt(
          outputData.position
        );

        const hash = this.grid.gridComponent.hashedTileIndex(
          tile.x, tile.y
        );

       
        if (this.hashMappedBoidRefs.has(hash)) {
          const b = this.hashMappedBoidRefs.get(hash)!;
          b.push(boidId);
        }
        else {
          this.hashMappedBoidRefs.set(hash, [boidId]); 
        }

        this.idMappedBoidData.set(boidId, {
          data: output[i]
        });

        // get the instance
        const instance = this.getBoidInstance(boidId);
        instance?.setGPUData(output[i]);
      }

  }

  public getBoidInstance (boidId: number) : BoidInstance | undefined {
    return this.idMappedBoidRefs.get(boidId);
  }

  public getBoidInfo (boidId: number) : BoidInformation | undefined {
    return this.idMappedBoidData.get(boidId);
  }

  public getBoidIdsAtTile (x: number, y: number) : number[] {
    const hash = this.grid.gridComponent.hashedTileIndex(x, y);
    return this.hashMappedBoidRefs.get(hash) ?? [];
  }

  public getBoidNeighbours (boidId: number) : number[] {
    const boid = this.getBoidInfo(boidId);
    if (!boid) return [];
    const tile = this.grid.gridComponent.gridTileAt(boid.data.position);
    const neighbours = this.grid.gridComponent.getNeighbours(tile.x, tile.y);

    let neighbourBoids: number[] = [];

    for (const neighbour of neighbours) {
      neighbourBoids = neighbourBoids.concat(this.getBoidIdsAtTile(neighbour.x, neighbour.y));
    }

    return neighbourBoids;
  }

  public boidIdsToBoids (boidId: number[]) : (BoidInstance | undefined)[] {
    return boidId.map((id) => this.idMappedBoidRefs.get(id));
  }

  private boidIdCounter: number = 0;

  public addBoid(init: BoidInitData): BoidInterface | undefined{

    if (this.instanceCount >= this.maxInstanceCount) {
      if (!this.warned) {
        this.warned = true;
        console.warn("Max instance count reached");
      }
      return undefined;
    }

    init.position[2] = 10; // Set the w component to 10

    const input : BoidInputData = {
      targetPosition: [init.position[0], init.position[1], init.position[2], 0],
      hasTarget: false,
      speed: init.speed,
      externalForce: [0, 0, 0, 0],
      diffuseColor: [1.0, 1.0, 1.0, 1.0],
      scale: this.boidScale,
      steeringSpeed: init.steeringSpeed,
      alive: true
    };

    this.compute.setElement<BoidInputData>("boid_input", this.instanceCount, input);

    this.compute.setElement<BoidGPUData>("boids", this.instanceCount, {
      avoidanceVector: vec4.create(),
      collisionVector: vec4.create(),
      externalForce: vec4.create(),
      lastModelPosition: [init.position[0], init.position[1], init.position[2], 0],
      position: [init.position[0], init.position[1], init.position[2], 0],
      steering: vec4.create()
    });

    const model = mat4.identity(mat4.create());
    mat4.translate(model, model, init.position);
    mat4.scale(model, model, [this.boidScale, this.boidScale, this.boidScale]);

    const position = vec3.clone(init.position);
    const tile = this.grid.gridComponent.gridTileAt(position);
    const boidId =  this.boidIdCounter++;

    this.compute.setElement<BoidObjectData>("objects", this.instanceCount, {
      model,
      hash: this.grid.gridComponent.hashedTileIndex(tile.x, tile.y),
      boidId:boidId,
      diffuseColor: [1.0, 1.0, 1.0, 1.0],
      visible: true,
    });



    this.idMappedIndex.set(boidId, this.instanceCount);
    this.indexMappedId.set(this.instanceCount, boidId);

    this.instanceCount++;

    this.compute.set("numBoids", this.instanceCount);


    const boidGo = new GameObject(`boid_${boidId}`, this.scene);

    const boid = new BoidInstance (
      boidId, this, input, new Vector3(init.position[0], init.position[1], init.position[2])
    );

    boidGo.addComponent(boid);

    this.boidRefs.push(boid);
    this.idMappedBoidRefs.set(boidId, boid);
    
    const boidInterface = new BoidInterface(
      boid,
      this.scene as BoidScene
    );

    return boidInterface;
  }

  public get objectBuffer () : GPUBuffer {
    return this.compute.getBuffer<BoidObjectData>("objects")!.gpuBuffer as GPUBuffer;
  }

  public setBoidInputData(index: number, data: Partial<BoidInputData>) {
    return this.compute.setPartialElement<BoidInputData>("boid_input", index, data, false);
  }

  public setBoidModelData (index: number, data: Partial<BoidObjectData>) {
    this.compute.setPartialElement<BoidObjectData>("objects", index, data);
  }

  public setGpuData (index: number, data: Partial<BoidGPUData>) {
    this.compute.setPartialElement<BoidGPUData>("boids", index, data);
  }

  public getBoidIndex(id: number): number | undefined {
    return this.idMappedIndex.get(id);
  }

  private dispatch(dT : number) {
    const sDT = dT / 1000; 

    this.compute.set("time", this.scene.sceneTime / 1000);
    this.compute.set("dT", sDT );
    this.compute.set("numBoids", this.instanceCount);

    const colliders = this.scene.findObjectsOfType<Collider>(Collider);
    this.compute.set("numColliders", colliders.length);

    colliders.forEach((collider, index) => {
      this.compute.setElement<Collider>("colliders", index, collider);
    });
    

    this.compute.dispatch(Math.ceil(this.instanceCount / 64));

  }

  public awake(): void {
    // this.run();
  }

  private updateBoidCount() {
    if (this.gameObject.mesh?.material)
      (this.gameObject.mesh?.material as BoidMaterial).instanceCount =
      this.instanceCount;
  }

  public override update(dT: number): void {
    super.update(dT);
    if (this.compute.ready) {

      this.compute.getBuffer("boid_input")?.upload(this.instanceCount);

      this.dispatch(dT);

      // Update the instances & hashing
      this.updateBoidInformation();
      
      this.updateBoidCount();  
    }
  }

}
