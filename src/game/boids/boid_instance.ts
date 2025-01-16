import Component from "@engine/scene/component";
import { BoidInputData, BoidOutputData } from "./boid_compute";
import { Vector3 } from "@engine/math/src";
import BoidSystemComponent from "./boid_system";
import { mat4, vec3 } from "gl-matrix";

/**
 * BoidInstance
 * ====
 * Represents a single boid instance, handles memory transfer <-> to the GPU.
 * Is attached to a GameObject which stores the transform data of the boid. 
 * Game Friendly access to the boid data.
 * This way we can attach components to boids for easy access to their data (eg. particle effects etc.)
 * This can be extended (ArrowBoidInstance, SoldierBoidInstance, etc.)
 */
export default class BoidInstance extends Component {

  private boidId: number = 0;
  private boidIndex: number = 0;
  private system: BoidSystemComponent;

  // Core 
  private _targetPosition : Vector3 = new Vector3();
  private _externalForce : Vector3 = new Vector3();
  private _diffuseColor : Vector3 = new Vector3();
  private _hasTarget : boolean = false;
  private _speed : number = 0.0;
  private _scale : number = 0.0;

  // Game Logic
  private originalColor: Vector3 = new Vector3(1, 1, 1);
  private originalScale: number = 0.0;
  private originalPosition: Vector3 = new Vector3();



  constructor(boidId: number, boidSystem: BoidSystemComponent, initial : BoidInputData, initialPosition: Vector3) {
    super();
    this.boidId = boidId;
    this.system = boidSystem;
    const boidIndex = this.system.getBoidIndex(this.boidId);
    this.boidIndex = boidIndex!;

    this.targetPosition = new Vector3(initial.targetPosition[0], initial.targetPosition[1], initial.targetPosition[2]);
    this.externalForce = new Vector3(initial.externalForce[0], initial.externalForce[1], initial.externalForce[2]);
    this.diffuseColor = new Vector3(initial.diffuseColor[0], initial.diffuseColor[1], initial.diffuseColor[2]);
    this.hasTarget = initial.hasTarget;
    this.speed = initial.speed;
    this.scale = initial.scale;

    this.originalPosition = initialPosition;
    
    this.originalColor = new Vector3(initial.diffuseColor[0], initial.diffuseColor[1], initial.diffuseColor[2]);
    this.originalScale = initial.scale;
  }

  //#region == Property Accessors ==

  public get id () : number {
    return this.boidId;
  }

  public get position () : Vector3 {
    return new Vector3(this.transform.position.x, this.transform.position.y, this.transform.position.z);
  }
  
  public set position (value : Vector3) {
    this.transform.position.set(value.x, value.y, value.z);

    // update on GPU 
    const model = mat4.create();
    mat4.translate(model, model, [value.x, value.y, value.z]);
    mat4.scale(model, model, [this._scale, this._scale, this._scale]);

    this.system.setBoidModelData(this.boidIndex, {model});

    this.system.setGpuData(this.boidIndex, {
      position: [value.x, value.y, value.z, 0],
      lastModelPosition: [value.x, value.y, value.z, 0],
    });
  }

  public get targetPosition() : Vector3 {
    return this._targetPosition;
  }

  public set targetPosition(value : Vector3) {
    this._targetPosition = value;
    
    this.system.setBoidInputData(this.boidIndex, {
      targetPosition: [this._targetPosition .x, this._targetPosition .y, this._targetPosition .z, 0],
      hasTarget: true,
    });
  }

  public get externalForce() : Vector3 {
    return this._externalForce;
  }

  public set externalForce(value : Vector3) {
    this._externalForce = value;

    this.system.setBoidInputData(this.boidIndex, {
      externalForce: [this._externalForce.x, this._externalForce.y, this._externalForce.z, 0],
    });
  }

  public get diffuseColor() : Vector3 {
    return this._diffuseColor;
  }

  public set diffuseColor(value : Vector3) {
    this._diffuseColor = value;
    this.system.setBoidInputData(this.boidIndex, {
      diffuseColor: [this._diffuseColor.x, this._diffuseColor.y, this._diffuseColor.z, 0],
    });
  }

  public get hasTarget() : boolean {
    return this._hasTarget;
  }

  public set hasTarget(value : boolean) {
    this._hasTarget = value;

    this.system.setBoidInputData(this.boidIndex, {
      hasTarget: this._hasTarget,
    });
  }

  public get speed() : number {
    return this._speed;
  }

  public set speed(value : number) {
    this._speed = value;
    this.system.setBoidInputData(this.boidIndex, {
      speed: this._speed,
    });
  }

  public get scale() : number {
    return this._scale;
  }

  public set scale(value : number) {
    this._scale = value;
    this.system.setBoidInputData(this.boidIndex, {
      scale: this._scale,
    });
  }

  public stop () {
    this.system.setBoidInputData(this.boidIndex, {
      speed: this._speed,
    });
  }

  //#endregion

  //#region == Memory Transfer ==
  setGPUData (boidOutputData : BoidOutputData) {
    this.transform.position.set(boidOutputData.position[0], boidOutputData.position[1], boidOutputData.position[2]);
  }
  
  getGPUInputData () : BoidInputData {
    const boidInputData = new BoidInputData();
    boidInputData.targetPosition = [this._targetPosition.x, this._targetPosition.y, this._targetPosition.z, 0];
    boidInputData.externalForce = [this._externalForce.x, this._externalForce.y, this._externalForce.z, 0];
    boidInputData.diffuseColor = [this._diffuseColor.x, this._diffuseColor.y, this._diffuseColor.z, 0];
    boidInputData.hasTarget = this._hasTarget;
    boidInputData.speed = this._speed;
    boidInputData.scale = this._scale;

    return boidInputData;
  }

  //#endregion

  //#region == Game Logic == 

  private colorPalette: vec3[] = [
    // [102.0/255.0, 172.0/255.0, 204.0/255.0],
    [150.0/255.0, 150.0/255.0, 150.0/255.0],
    // [243.0/255.0, 131.0/255.0, 85.0/255.0],
    [110.0/255.0, 110.0/255.0, 110.0/255.0],
  ];
  
  async setUnitColor () {
    await this.scene.seconds(0.1);
    const boidColor = this.colorPalette[Math.floor(Math.random() * this.colorPalette.length)];
    this.diffuseColor = new Vector3(boidColor[0], boidColor[1], boidColor[2]);
    this.originalColor = new Vector3(boidColor[0], boidColor[1], boidColor[2]);
  }
  
  async knockbackForce (id: number, force: Vector3) {
    this.externalForce = new Vector3(force.x, force.y, force.z);
    this.diffuseColor = new Vector3(1, 1, 1);
    this.scale = this.originalScale * 1.2;

    await this.scene.seconds(Math.random() * 0.1 + 0.05);

    this.diffuseColor = this.originalColor;
    this.externalForce = new Vector3(0, 0, 0);
    this.scale = this.originalScale;
  }

  public attack (x: number, y: number) {
    // get the neighbours 
    const neighbours = this.system.getBoidNeighbours(this.id);
    const boids = this.system.boidIdsToBoids(neighbours) as BoidInstance[];

    for (let i = 0; i < boids.length; i++) {
      if (boids[i].boidId == this.id) continue;

      // check distance 
      const distance = this.position.distanceTo(new Vector3(boids[i].position.x, boids[i].position.y, boids[i].position.z));
      if (distance < 0.4) {
        // get dot product of (x,y) and (boid[i].position - boid[boidId].position)
        const dir = new Vector3(x, y, 0);
        dir.normalize();

        const boidDir = new Vector3();
        const boidPosition = new Vector3(boids[i].position.x, boids[i].position.y, boids[i].position.z);
        const thisPosition = new Vector3(this.position.x, this.position.y, this.position.z);
        boidDir.subVectors(boidPosition, thisPosition);
        boidDir.normalize();

        const dot = dir.dot(boidDir);
        // check if roughly parallel and in the same direction
        if (dot < -0.9 ) {
          // set external force away from the boid
          const force = new Vector3();
          force.copy(boidDir).multiplyScalar(-0.5);
          this.knockbackForce(boids[i].boidId, force);
        }
      }

    }

  }

  //#endregion

  public awake(): void {
    this.position = this.originalPosition;
    this.setUnitColor();
  }
}