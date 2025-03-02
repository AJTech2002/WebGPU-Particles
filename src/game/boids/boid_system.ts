import Component from "@engine/scene/component";
import { mat4, vec3, vec4 } from "gl-matrix";
import BoidMaterial from "./rendering/boid_material";
import Collider from "@engine/scene/core/collider_component";
import { BoidCompute, BoidGPUData, BoidInputData, BoidObjectData, BoidOutputData, CollisionHitData, maxInstanceCount } from "./boid_compute";
import BoidInstance from "./boid_instance";
import GameObject from "@engine/scene/gameobject";
import { Vector3 } from "@engine/math/src";
import BoidScene from "@game/boid_scene";
import { GridComponent } from "@game/grid/grid";
import { DynamicUniform } from "@engine/ts-compute/dynamic-uniform";
import BoidOutlineMaterial from "./rendering/boid_outline_material";


interface BoidInitData {
  position: vec3;
  speed: number;
  steeringSpeed: number;
  avoidanceForce: number;
  textureIndex: number;
  scale: number;
  clampToGrid: boolean;
  outlineColor: vec4;
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

export interface BoidSearchFilter {
  ownerId?: number;
  range?: number;
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

  private colliderIndexMappedToType = new Map<number, NeighbourType>();

  // Remove this later & optimize
  public hashMappedBoidRefs = new Map<number, Map<number, Neighbour>>();

  public boidRefs: BoidInstance[] = [];

  private compute: BoidCompute;
  private warned: boolean = false;
  public grid: GridComponent;
  private boidScale: number = 0.3;
  private slots: number[] = [];
  private _colliders: Collider[] = [];

  constructor(grid: GridComponent) {
    super();
    this.grid = grid;
    this.compute = new BoidCompute();
    this.compute.init();

    this.slots = Array.from({ length: this.maxInstanceCount }, (_, i) => i);
  }

  public async updateBoidInformation(): Promise<void> {

    const boidOutput = this.compute.getBuffer<BoidOutputData>("boid_output");
    const collisionCountBuffer = this.compute.getBuffer<number>("collisionHitCount");
    const collisionData = this.compute.getBuffer<CollisionHitData>("collisionHits");

    if (!boidOutput) {
      console.error("Boid data not initialized");
      return;
    }

    if (!collisionCountBuffer) {
      console.error("Collision data not initialized");
      return;
    }

    if (!collisionData) {
      console.error("Collision data not initialized");
      return;
    }

    const output = await boidOutput.readTo(this.instanceCount);
    const collisionCount = await collisionCountBuffer.read();


    if (collisionCount !== null && collisionCount[0] > 0) {

      const collisionHits = await collisionData.readTo(collisionCount[0]);

      if (collisionHits)
        for (let i = 0; i < collisionHits.length; i++) {
          const hit = collisionHits[i];
          const boidIndex = hit.boidId;
          const boidId = this.indexMappedId.get(boidIndex) ?? -1;

          if (boidId == -1) {
            console.warn("Boid Index not found", boidIndex);
            continue;
          }

          const boid = this.getBoidInstance(boidId);
          if (boid) {
            boid.gameObject.on_collision(this._colliders[hit.colliderId]);
          }
        }

    }

    await this.scene.tick();

    if (output)
      for (let i = 0; i < output.length; i++) {

        const outputData = output[i];
        const boidId = this.indexMappedId.get(i) ?? -1;


        if (boidId == -1 && i < this.instanceCount) {
          // console.warn("Boid Index not found", i);
          continue;
        }

        const unit = (this.scene as BoidScene).getUnit(boidId);
        this.idMappedBoidData.set(boidId, {
          data: output[i]
        });
        // get the instance
        const instance = this.getBoidInstance(boidId);
        instance?.setGPUData(output[i]);
      }

  }

  public getBoidInstance(boidId: number): BoidInstance | undefined {
    return this.idMappedBoidRefs.get(boidId);
  }

  public getBoidInfo(boidId: number): BoidInformation | undefined {
    return this.idMappedBoidData.get(boidId);
  }

  public getBoidIdsAtTile(x: number, y: number): Neighbour[] {
    const hash = this.grid.hashedTileIndex(x, y);
    const map = this.hashMappedBoidRefs.get(hash);
    const boids: Neighbour[] = [];

    if (map) {
      for (const [key, value] of map) {
        boids.push(value);
      }
    }

    return boids;
  }

  public getBoidNeighbours(boidId: number): Neighbour[] {
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

  public setBoidHash(neighbour: Neighbour, hash: number) {
    if (!this.hashMappedBoidRefs.has(hash)) {
      this.hashMappedBoidRefs.set(hash, new Map());
    }

    const map = this.hashMappedBoidRefs.get(hash);
    if (!map) return;

    map.set(neighbour.id, neighbour);
  }

  public removeBoidHash(boidId: number, hash: number) {
    if (!this.hashMappedBoidRefs.has(hash)) {
      this.hashMappedBoidRefs.set(hash, new Map());
    }

    const map = this.hashMappedBoidRefs.get(hash);
    if (!map) return;

    map.delete(boidId);
  }

  public getBoidsInTile(x: number, y: number, filter?: BoidSearchFilter): BoidInstance[] {
    const hash = this.grid.hashedTileIndex(x, y);
    const boidIds = this.hashMappedBoidRefs.get(hash);
    if (!boidIds) return [];
    const boidInstances: BoidInstance[] = [];
    for (const [id, neighbour] of boidIds) {
      const boid = this.getBoidInstance(id);

      if (filter) {
        if (filter.ownerId !== undefined) {
          const unit = (this.scene as BoidScene).getUnit(id);
          if (unit.ownerId !== filter.ownerId) continue;
        }
        if (filter.range !== undefined) {
          const boidInfo = this.getBoidInfo(id);
          if (boidInfo) {
            const distance = vec3.distance(boidInfo.data.position, this.getBoidInfo(id.id)!.data.position);
            if (distance > filter.range) continue;
          }
        }
      }

      if (boid) boidInstances.push(boid);
    }
    return boidInstances;
  }

  public getBoidsInTiles(tiles: { x: number, y: number }[], filter?: BoidSearchFilter): BoidInstance[] {
    const boids: BoidInstance[] = [];
    for (const tile of tiles) {
      boids.push(...this.getBoidsInTile(tile.x, tile.y, filter));
    }
    return boids;
  }

  public boidIdsToBoids(boidId: number[]): (BoidInstance | undefined)[] {
    return boidId.map((id) => this.idMappedBoidRefs.get(id));
  }

  private boidIdCounter: number = 0;

  public removeBoid(boidId: number) {
    const index = this.idMappedIndex.get(boidId);
    if (index === undefined) return;
    this.slots.push(index);
    this.indexMappedId.delete(index);
    const boidRef = this.idMappedBoidRefs.get(boidId);
    this.removeBoidHash(boidId, boidRef.lastHash);
    this.boidRefs = this.boidRefs.filter((boid) => boid.id !== boidId);
    this.idMappedBoidRefs.delete(boidId);
    this.idMappedIndex.delete(boidId);

  }

  public addBoid(init: BoidInitData): BoidSpawnData | undefined {

    if (this.slots.length <= 0) {
      // console.warn("No slots available");
      return undefined;
    }

    const slot = this.slots.shift()!;
    init.position[2] = 10; // Set the w component to 10

    const input: BoidInputData = {
      targetPosition: [init.position[0], init.position[1], init.position[2], 0],
      hasTarget: false,
      speed: init.speed,
      externalForce: [0, 0, 0, 0],
      diffuseColor: [1.0, 1.0, 1.0, 1.0],
      scale: 0,
      steeringSpeed: init.steeringSpeed,
      alive: true,
      avoidanceForce: init.avoidanceForce,
      clampToGrid: init.clampToGrid
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
    const boidId = this.boidIdCounter++;

    const modelData: BoidObjectData = {
      model,
      hash: this.grid.hashedTileIndex(tile.x, tile.y),
      boidId: boidId,
      diffuseColor: [1.0, 1.0, 1.0, 1.0],
      visible: true,
      textureIndex: init.textureIndex,
      outlineColor: init.outlineColor,
    }

    this.compute.setElement<BoidObjectData>("objects", slot, modelData);

    this.idMappedIndex.set(boidId, slot);
    this.indexMappedId.set(slot, boidId);

    // remove index from slot

    this.compute.set("numBoids", this.instanceCount);


    const boidGo = new GameObject(`boid_${boidId}`, this.scene);

    const boid = new BoidInstance(
      boidId, this, input, new Vector3(init.position[0], init.position[1], init.position[2]), modelData
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

  public get objectBuffer(): GPUBuffer {
    return this.compute.getBuffer<BoidObjectData>("objects")!.gpuBuffer as GPUBuffer;
  }

  public get colliderStorageDyn(): DynamicUniform<Collider> {
    return this.compute.getBuffer<Collider>("colliders")!;
  }

  public get colliders(): Collider[] {
    return this._colliders;
  }

  public get boidStorageDyn(): DynamicUniform<BoidGPUData> {
    return this.compute.getBuffer<BoidGPUData>("boids")!;
  }

  public setBoidInputData(index: number, data: Partial<BoidInputData>) {
    return this.compute.setPartialElement<BoidInputData>("boid_input", index, data, false);
  }

  public setBoidModelData(index: number, data: Partial<BoidObjectData>) {
    this.compute.setPartialElement<BoidObjectData>("objects", index, data);
  }

  public setGpuData(index: number, data: Partial<BoidGPUData>) {
    this.compute.setPartialElement<BoidGPUData>("boids", index, data);
  }

  public getBoidIndex(id: number): number | undefined {
    return this.idMappedIndex.get(id);
  }

  public addCollider(collider: Collider) {

    if (this._colliders.length >= 100) {
      console.warn("Max colliders reached");
      return;
    }

    this._colliders.push(collider);
  }

  public removeCollider(collider: Collider) {
    this._colliders = this._colliders.filter((c) => c !== collider);
  }

  private dispatch(dT: number) {

    this.compute.set("time", this.scene.sceneTime);
    this.compute.set("dT", dT);
    this.compute.set("numBoids", this.instanceCount);
    this.compute.set("collisionHitCount", 0);
    this.compute.set("gridWidth", this.grid.size.x * this.grid.cell_size);

    let colCount = 0;
    for (let i = 0; i < this._colliders.length; i++) {
      if (this._colliders[i] && this._colliders[i].inverted !== null)
        try {
          this.compute.setElement<Collider>("colliders", colCount, this._colliders[i]);
          colCount++;
        }
        catch (e) {
          console.error(e, this._colliders[i]);
        }
    }

    this.compute.set("numColliders", colCount);
    this.compute.dispatch(Math.ceil(this.instanceCount / 64));

  }

  public awake(): void {
    // this.run();
  }

  private updateBoidCount() {
    // loop through materials and set instance count
    for (const material of this.gameObject.mesh.materials) {
      if (material instanceof BoidMaterial || material instanceof BoidOutlineMaterial) {
        material.instanceCount = this.instanceCount;
      }
    }
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
