import Component from "@engine/scene/component";
import { mat4, vec3, vec4 } from "gl-matrix";

import computeShaderCode from "./shaders/compute.wgsl";
import collisionShaderCode from "./shaders/collisions.wgsl";

import BoidMaterial from "./boid_material";
import {Boid} from "./boid";
import Compute from "@engine/ts-compute/compute";
import Collider from "@engine/scene/core/collider_component";
import { BoidCompute, BoidData, BoidObjectData, maxInstanceCount } from "./boid_compute";
import { Grid } from "../grid/grid_go";


interface BoidInitData {
  position: vec3;
  speed: number;
}

interface BoidInformation {
  data: BoidData;
  object: BoidObjectData;
}

// This will be responsible for storing boid data & running compute pipeline
// Updating boid data & setting boid data should be done in the BoidRunnerComponent
export default class BoidSystemComponent extends Component {

  public instanceCount: number = 0;
  public maxInstanceCount: number = maxInstanceCount;

  public boids: BoidData[] = [];
  public boidObjects: BoidObjectData[] = [];

  public idMappedBoidData = new Map<number, BoidInformation>();
  public idMappedIndex = new Map<number, number>();
  public idMappedBoidRefs = new Map<number, Boid>();
  public hashMappedBoidRefs = new Map<number, number[]>();
  public boidRefs: Boid[] = [];

  private compute: BoidCompute;
  private warned: boolean = false;

  private grid: Grid; 
  
  constructor( grid: Grid ) {
    super();
    this.grid = grid;
    this.compute = new BoidCompute();
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

    // Hashing support
    
    this.hashMappedBoidRefs.clear();
    this.idMappedBoidData.clear();
    this.idMappedIndex.clear();

    //TODO: Remove this and optimize on GPU 
    if (boidInfo)
    for (let i = 0; i < boidInfo?.length; i++) {
      if (this.boidObjects[i] == null) continue;

      const boid = this.boidObjects[i];
      const boidId = this.boidObjects[i].boidId;

      const tile = this.grid.gridComponent.gridTileAt(this.boidObjects[i].position);
      const hash = this.grid.gridComponent.hashedTileIndex(
        tile.x, tile.y
      );

      if (boid) {
        if (this.hashMappedBoidRefs.has(hash)) {
          const b = this.hashMappedBoidRefs.get(hash)!;
          b.push(boid.boidId);
        }
        else {
          this.hashMappedBoidRefs.set(hash, [boid.boidId]); 
        }

        this.idMappedBoidData.set(boidId, {
          data: boidInfo[i],
          object: boid
        });

        this.idMappedIndex.set(boidId, i);
      }

      this.compute.setPartialElement("objects", i, {
        hash
      });
    }

  }

  public getBoidInfo (boidId: number) : BoidInformation | undefined {
    return this.idMappedBoidData.get(boidId);
  }

  private boidIdCounter: number = 0;

  public addBoid(init: BoidInitData): Boid | undefined{

    if (this.instanceCount >= this.maxInstanceCount) {
      if (!this.warned) {
        this.warned = true;
        console.warn("Max instance count reached");
      }
      return undefined;
    }

    init.position[2] = 10; // Set the w component to 10

    this.compute.setElement<BoidData>("boids", this.instanceCount, {
      targetPosition: [init.position[0], init.position[1], init.position[2], 0],
      avoidanceVector: vec4.create(),
      hasTarget: true,
      speed: init.speed,
      collisionVector: vec4.create()
    });

    const model = mat4.identity(mat4.create());
    mat4.translate(model, model, init.position);
    mat4.scale(model, model, [0.3, 0.3, 0.3]);

    const position = vec3.clone(init.position);
    const tile = this.grid.gridComponent.gridTileAt(position);
    const boidId =  this.boidIdCounter++;
    this.compute.setElement<BoidObjectData>("objects", this.instanceCount, {
      model,
      position,
      hash: this.grid.gridComponent.hashedTileIndex(tile.x, tile.y),
      boidId:boidId,
      diffuseColor: [1.0, 1.0, 1.0],
      padding1: 0,
      padding2: 0,
    });

    const boid = new Boid(
      this, boidId, init.position
    )

    this.boidRefs.push(boid);
    this.idMappedBoidRefs.set(boidId, boid);

    this.instanceCount++;

    this.compute.set("numBoids", this.instanceCount);


    return boid;
  }

  public setBoidColor (id: number, color: vec3) {
    
    const index = this.idMappedIndex.get(id) ?? -1;

    if (index >= this.instanceCount) {
      console.error("Index out of bounds", index, this.instanceCount);
      return;
    }

    this.compute.setPartialElement<BoidObjectData>("objects", index, {
      diffuseColor: color
    });
  }

  public setBoidPosition(id: number, position: vec3): void {
    
    const index = this.idMappedIndex.get(id) ?? -1;

    if (index >= this.instanceCount) {
      console.error("Index out of bounds", index, this.instanceCount);
      return;
    }

    if (index == -1) {
      console.error("Index not found", id);
      return;
    }

    const model = mat4.create();
    mat4.translate(model, model, position);
    mat4.scale(model, model, [0.3, 0.3, 0.3]);

    this.compute.setPartialElement<BoidObjectData>("objects", index, {
      model,
      position,
    });

  
  }

  public get objectBuffer () : GPUBuffer {
    return this.compute.getBuffer<BoidObjectData>("objects")!.gpuBuffer as GPUBuffer;
  }

  public setBoidTarget(id: number, target: vec3): void {
      
    const index = this.idMappedIndex.get(id) ?? -1;

    if (index >= this.instanceCount) {
      console.error("Index out of bounds", index, this.instanceCount);
      return;
    }

    this.compute.setPartialElement<BoidData>("boids", index, {
      targetPosition: [target[0], target[1], target[2], 0],
      hasTarget: true,
    });
  }

  public awake(): void {}

  public update(dT: number): void {
    if (this.compute.ready) {

      const sDT = dT / 1000;

      this.compute.set("time", this.scene.sceneTime / 1000);
      this.compute.set("dT", sDT * 1.0);
      this.compute.set("numBoids", this.instanceCount);

      var colliders = this.scene.findObjectsOfType<Collider>(Collider);
      this.compute.set("numColliders", colliders.length);

      colliders.forEach((collider, index) => {
        this.compute.setElement<Collider>("colliders", index, collider);
      });

      this.compute.dispatch(Math.ceil(this.instanceCount / 64));
      
      // [ ~~ Update Boid Information ~~ ]
      this.updateBoidInformation(); 

      if (this.gameObject.mesh?.material)
        (this.gameObject.mesh?.material as BoidMaterial).instanceCount =
          this.instanceCount;
    }
  }
}
