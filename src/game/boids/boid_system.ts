import Component from "@engine/scene/component";
import { mat4, vec3, vec4 } from "gl-matrix";
import BoidMaterial from "./rendering/boid_material";
import {BoidInterface} from "./interfaces/boid_interface";
import Collider from "@engine/scene/core/collider_component";
import { BoidCompute, BoidGPUData, BoidInputData, BoidObjectData, BoidOutputData, maxInstanceCount } from "./boid_compute";
import { Grid } from "../grid/grid_go";


interface BoidInitData {
  position: vec3;
  speed: number;
}

interface BoidInformation {
  data: BoidOutputData;
}

// This will be responsible for storing boid data & running compute pipeline
// Updating boid data & setting boid data should be done in the BoidRunnerComponent
export default class BoidSystemComponent extends Component {

  public instanceCount: number = 0;
  public maxInstanceCount: number = maxInstanceCount;

  public boids: BoidInputData[] = [];
  public boidObjects: BoidObjectData[] = [];

  public idMappedBoidData = new Map<number, BoidInformation>();
  
  public idMappedIndex = new Map<number, number>();
  public indexMappedId = new Map<number, number>();

  public idMappedBoidRefs = new Map<number, BoidInterface>();
  public hashMappedBoidRefs = new Map<number, number[]>();
  public boidRefs: BoidInterface[] = [];

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
        if (boidId == -1) {
          console.warn("Boid Id not found", i);
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
      }

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

  public boidIdsToBoids (boidId: number[]) : (BoidInterface | undefined)[] {
    return boidId.map((id) => this.idMappedBoidRefs.get(id));
  }


  private boidIdCounter: number = 0;

  async setUnitColor (id: number) {
    await this.scene.tick();
    await this.scene.seconds(0.05);
    const boidColor : vec3 = [
      Math.random(),
      Math.random(),
      Math.random()
    ]
    this.setBoidColor(id, boidColor);
    // get boid 
    const boid = this.idMappedBoidRefs.get(id);
    if (boid)
      boid.__origColor__ = boidColor;
  }

  async flashUnit (id: number) {

    const boid = this.idMappedBoidRefs.get(id);

    if (!boid) return;

    this.setBoidColor(id, [1, 1, 1]);

    await this.scene.seconds(0.3);

    this.setBoidColor(id, boid.__origColor__);

  }

  public attack (boidId: number, x: number, y: number) {
    const neighbours = this.getBoidNeighbours(boidId);
    const boids = this.boidIdsToBoids(neighbours) as BoidInterface[];

    for (let i = 0; i < boids.length; i++) {
      if (boids[i].boidId == boidId) continue;

      // check distance 
      const distance = vec3.distance(boids[i].position, this.idMappedBoidRefs.get(boidId)!.position);
      if (distance < 0.4) {

        // get dot product of (x,y) and (boid[i].position - boid[boidId].position)
        const dir = vec3.fromValues(x, y, 0);
        vec3.normalize(dir, dir);

        const boidDir = vec3.create();
        vec3.sub(boidDir, boids[i].position, this.idMappedBoidRefs.get(boidId)!.position);
        vec3.normalize(boidDir, boidDir);

        const dot = vec3.dot(dir, boidDir);
        // check if roughly parallel and in the same direction
        if (dot > 0.6 ) {
          this.flashUnit(boids[i].boidId);
          // set external force away from the boid
          const force = vec3.create();
          vec3.scale(force, boidDir, 6.5);
          this.setBoidExternalForce(boids[i].boidId, force);

        }
      }

    }

  }

  public addBoid(init: BoidInitData): BoidInterface | undefined{

    if (this.instanceCount >= this.maxInstanceCount) {
      if (!this.warned) {
        this.warned = true;
        console.warn("Max instance count reached");
      }
      return undefined;
    }

    init.position[2] = 10; // Set the w component to 10

    this.compute.setElement<BoidInputData>("boid_input", this.instanceCount, {
      targetPosition: [init.position[0], init.position[1], init.position[2], 0],
      hasTarget: false,
      speed: init.speed,
      externalForce: [0, 0, 0, 0]
    });

    this.compute.setElement<BoidGPUData>("boids", this.instanceCount, {
      avoidanceVector: vec4.create(),
      collisionVector: vec4.create(),
      externalForce: vec4.create(),
      lastModelPosition: [init.position[0], init.position[1], init.position[2], 0],
      position: [init.position[0], init.position[1], init.position[2], 0],
    });

    const model = mat4.identity(mat4.create());
    mat4.translate(model, model, init.position);
    mat4.scale(model, model, [0.3, 0.3, 0.3]);

    const position = vec3.clone(init.position);
    const tile = this.grid.gridComponent.gridTileAt(position);
    const boidId =  this.boidIdCounter++;

    this.compute.setElement<BoidObjectData>("objects", this.instanceCount, {
      model,
      hash: this.grid.gridComponent.hashedTileIndex(tile.x, tile.y),
      boidId:boidId,
      diffuseColor: [1.0, 1.0, 1.0],
      padding2: 0,
    });

    const boid = new BoidInterface(
      this, boidId, init.position
    )

    this.boidRefs.push(boid);
    this.idMappedBoidRefs.set(boidId, boid);
    this.idMappedIndex.set(boidId, this.instanceCount);
    this.indexMappedId.set(this.instanceCount, boidId);

    this.instanceCount++;

    this.compute.set("numBoids", this.instanceCount);
    return boid;
  }


  public setBoidExternalForce(id: number, force: vec3): void {
    const index = this.idMappedIndex.get(id) ?? -1;

    if (index >= this.instanceCount) {
      console.error("Index out of bounds", index, this.instanceCount);
      return;
    }

    if (index == -1) {
      console.error("Index not found", id);
      return;
    }

    this.compute.setPartialElement<BoidInputData>("boids", index, {
      externalForce: [force[0], force[1], force[2], 0]
    });
  }

  public setBoidColor (id: number, color: vec3) {

    const index = this.idMappedIndex.get(id) ?? -1;

    if (index == -1) {
      console.error("Index not found", id);
      return;
    } 

    if (index >= this.instanceCount) {
      console.error("Index out of bounds", index, this.instanceCount);
      return;
    }

    this.compute.setPartialElement<BoidObjectData>("objects", index, {
      diffuseColor: color
    });
  }

  //TODO
  public setBoidPosition(id: number, position: vec3): void {
    console.error("Not implemented");
    return;

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

    this.compute.setPartialElement<BoidInputData>("boids", index, {
      targetPosition: [target[0], target[1], target[2], 0],
      hasTarget: true,
    });
  }

  private dispatch(dT) {
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

  private async run() {
    while (true) {
      await this.scene.tick();
      if (this.compute.ready) {
        this.dispatch();
        this.updateBoidInformation();
        
       
      }
    }
  }

  public awake(): void {
    // this.run();
  }

  public override update(dT: number): void {
    super.update(dT);
    if (this.compute.ready) {
      this.dispatch(dT);
      // this.updateBoidInformation();
      if (this.gameObject.mesh?.material)
        (this.gameObject.mesh?.material as BoidMaterial).instanceCount =
        this.instanceCount;
    }
  }

}
