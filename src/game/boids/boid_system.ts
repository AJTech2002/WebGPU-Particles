import Component from "@engine/scene/component";
import { mat4, vec3, vec4 } from "gl-matrix";
import BoidMaterial from "./rendering/boid_material";
import Collider from "@engine/scene/core/collider_component";
import { BoidCompute, BoidGPUData, BoidInputData, BoidObjectData, BoidOutputData, maxInstanceCount } from "./boid_compute";
import BoidInstance from "./boid_instance";
import GameObject from "@engine/scene/gameobject";
import { Vector3 } from "@engine/math/src";
import BoidScene from "@game/boid_scene";
import { GridComponent } from "@game/grid/grid_go";
import { DynamicUniform } from "@engine/ts-compute/dynamic-uniform";


interface BoidInitData {
  position: vec3;
  speed: number;
  steeringSpeed: number;
}

interface BoidSpawnData {
  instance: BoidInstance,
  gameObject: GameObject,
  id: number
}
interface BoidInformation {
  data: BoidOutputData;
}

export enum NeighbourType {
  Friendly = 0,
  Enemy = 1,
} 

export interface Neighbour {
  id: number;
  ownerId: number;
}


// This will be responsible for storing boid data & running compute pipeline
// Updating boid data & setting boid data should be done in the BoidRunnerComponent
export default class BoidSystemComponent extends Component {

  //MARK: Properties
  public instanceCount: number = maxInstanceCount;
  public maxInstanceCount: number = maxInstanceCount;

  public boids: BoidInputData[] = [];
  public boidObjects: BoidObjectData[] = [];

  public idMappedBoidData = new Map<number, BoidInformation>();
  
  public idMappedIndex = new Map<number, number>();
  public indexMappedId = new Map<number, number>();

  public idMappedBoidRefs = new Map<number, BoidInstance>();

  // Remove this later & optimize
  public hashMappedBoidRefs = new Map<number, Neighbour[]>();
  
  public boidRefs: BoidInstance[] = [];

  private compute: BoidCompute;
  private warned: boolean = false;
  private grid: GridComponent; 
  private boidScale: number = 0.3;
  private slots: number[] = [];
  private _colliders: Collider[] = [];

  constructor( grid: GridComponent ) {
    super();
    this.grid = grid;
    this.compute = new BoidCompute();
    this.compute.init();

    this.slots = Array.from({length: this.maxInstanceCount}, (_, i) => i);
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
          // console.warn("Boid Index not found", i);
          continue;
        }

        const unit = (this.scene as BoidScene).getUnit(boidId);

        if (unit && unit.alive) {
          const tile = this.grid.gridTileAt(
            outputData.position
          );
  
          const hash = this.grid.hashedTileIndex(
            tile.x, tile.y
          );
  
         
          if (this.hashMappedBoidRefs.has(hash)) {
            const b = this.hashMappedBoidRefs.get(hash)!;
            
            if (b) {
              b.push({
                id: boidId,
                ownerId: unit.ownerId
              });
            }
          }
          else {
            if ((this.scene as BoidScene).getUnit(boidId)?.alive) {
            this.hashMappedBoidRefs.set(hash, [{
              id: boidId,
              ownerId: unit.ownerId
            }]); 
            }
          }
  
          this.idMappedBoidData.set(boidId, {
            data: output[i]
          });
  
          // get the instance
          const instance = this.getBoidInstance(boidId);
          instance?.setGPUData(output[i]);
        }
      }

  }

  public getBoidInstance (boidId: number) : BoidInstance | undefined {
    return this.idMappedBoidRefs.get(boidId);
  }

  public getBoidInfo (boidId: number) : BoidInformation | undefined {
    return this.idMappedBoidData.get(boidId);
  }

  public getBoidIdsAtTile (x: number, y: number) : Neighbour[] {
    const hash = this.grid.hashedTileIndex(x, y);
    return this.hashMappedBoidRefs.get(hash) ?? [];
  }

  public getBoidNeighbours (boidId: number) : Neighbour[] {
    const boid = this.getBoidInfo(boidId);
    if (!boid) return [];
    const tile = this.grid.gridTileAt(boid.data.position);
    const neighbours = this.grid.getNeighbours(tile.x, tile.y);

    let neighbourBoids: Neighbour[] = [];

    for (const neighbour of neighbours) {
      neighbourBoids = neighbourBoids.concat(this.getBoidIdsAtTile(neighbour.x, neighbour.y));
    }

    return neighbourBoids;
  }

  public boidIdsToBoids (boidId: number[]) : (BoidInstance | undefined)[] {
    return boidId.map((id) => this.idMappedBoidRefs.get(id));
  }

  private boidIdCounter: number = 0;

  public removeBoid (boidId: number) {
    const index = this.idMappedIndex.get(boidId);
    if (index === undefined) return;
    this.slots.push(index);
    this.indexMappedId.delete(index);
    this.boidRefs = this.boidRefs.filter((boid) => boid.id !== boidId);
  }

  public addBoid(init: BoidInitData): BoidSpawnData | undefined{

    if (this.slots.length <= 0) {
      // console.warn("No slots available");
      return undefined;
    }

    const slot = this.slots.shift()!;
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

    this.compute.setElement<BoidInputData>("boid_input", slot, input);

    this.compute.setElement<BoidGPUData>("boids", slot, {
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
    const tile = this.grid.gridTileAt(position);
    const boidId =  this.boidIdCounter++;

    this.compute.setElement<BoidObjectData>("objects", slot, {
      model,
      hash: this.grid.hashedTileIndex(tile.x, tile.y),
      boidId:boidId,
      diffuseColor: [1.0, 1.0, 1.0, 1.0],
      visible: true,
    });



    this.idMappedIndex.set(boidId, slot);
    this.indexMappedId.set(slot, boidId);

    // remove index from slot
    
    this.compute.set("numBoids", this.instanceCount);


    const boidGo = new GameObject(`boid_${boidId}`, this.scene);

    const boid = new BoidInstance (
      boidId, this, input, new Vector3(init.position[0], init.position[1], init.position[2])
    );

    boidGo.transform.position = new Vector3(init.position[0], init.position[1], init.position[2]);
    boidGo.addComponent(boid, false); // Don't call `update` 

    this.boidRefs.push(boid);
    this.idMappedBoidRefs.set(boidId, boid);
    
    return {
      instance: boid,
      gameObject: boidGo,
      id: boidId
    };
  
  }

  public get objectBuffer () : GPUBuffer {
    return this.compute.getBuffer<BoidObjectData>("objects")!.gpuBuffer as GPUBuffer;
  }

  public get colliderStorageDyn () : DynamicUniform<Collider> {
    return this.compute.getBuffer<Collider>("colliders")!;
  }

  public get colliders () : Collider[] {
    return this._colliders;
  }

  public get boidStorageDyn () : DynamicUniform<BoidGPUData> {
    return this.compute.getBuffer<BoidGPUData>("boids")!;
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

  public addCollider (collider: Collider) {

    if (this._colliders.length >= 100) {
      console.warn("Max colliders reached");
      return;
    }

    this._colliders.push(collider);
  }

  private dispatch(dT : number) {
    const sDT = dT / 1000; 

    this.compute.set("time", this.scene.sceneTime / 1000);
    this.compute.set("dT", sDT );
    this.compute.set("numBoids", this.instanceCount);

    this.compute.set("numColliders", this._colliders.length);

    for (let i = 0; i < this._colliders.length; i++) {
      this.compute.setElement<Collider>("colliders", i, this._colliders[i]);
    }

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
