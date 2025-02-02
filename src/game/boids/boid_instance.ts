import Component from "@engine/scene/component";
import { BoidInputData, BoidOutputData } from "./boid_compute";
import { Vector3, Vector4 } from "@engine/math/src";
import BoidSystemComponent, { Neighbour } from "./boid_system";
import { mat4, vec3 } from "gl-matrix";
import Collider from "@engine/scene/core/collider_component";

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
  private _diffuseColor : Vector4 = new Vector4();
  private _hasTarget : boolean = false;
  private _speed : number = 0.0;
  private _scale : number = 0.0;
  private _avoidanceForce : number = 1.0;
  
  // Game Logic
  public originalColor: Vector4 = new Vector4(1, 1, 1);
  public originalScale: number = 0.0;
  public originalPosition: Vector3 = new Vector3();

  constructor(boidId: number, boidSystem: BoidSystemComponent, initial : BoidInputData, initialPosition: Vector3) {
    super();
    this.boidId = boidId;
    this.system = boidSystem;
    const boidIndex = this.system.getBoidIndex(this.boidId);
    this.boidIndex = boidIndex!;

    this.targetPosition = new Vector3(initial.targetPosition[0], initial.targetPosition[1], initial.targetPosition[2]);
    this.externalForce = new Vector3(initial.externalForce[0], initial.externalForce[1], initial.externalForce[2]);
    this.diffuseColor = new Vector4(initial.diffuseColor[0], initial.diffuseColor[1], initial.diffuseColor[2], initial.diffuseColor[3]);
    this.hasTarget = initial.hasTarget;
    this.speed = initial.speed;
    this.scale = initial.scale;

    this.originalPosition = initialPosition;

    this.originalColor = new Vector4(initial.diffuseColor[0], initial.diffuseColor[1], initial.diffuseColor[2], initial.diffuseColor[3]);
    this.originalScale = initial.scale;


  }

  //#region == Property Accessors ==

  public get index() : number {
    return this.boidIndex;
  }

  public set index(value : number) {
    this.boidIndex = value;
  }

  public get id () : number {
    return this.boidId;
  }

  public get alive () : boolean {
    return this.gameObject?.active ?? true;
  }

  public get position () : Vector3 {
    return new Vector3(this.transform.position.x, this.transform.position.y, this.transform.position.z);
  }

  public setAlive (alive: boolean) {
    this.system.setBoidInputData(this.boidIndex, {
      alive: alive,
    });
  }

  public set position (value : Vector3) {

    if (!this.alive) return;

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

    if (!this.alive) return;

    this._targetPosition = value;

    this.system.setBoidInputData(this.boidIndex, {
      targetPosition: [this._targetPosition .x, this._targetPosition .y, this._targetPosition .z, 0],
      hasTarget: true,
    });
  }

  public get avoidanceForce() : number {
    return this._avoidanceForce;
  }

  public set avoidanceForce(value : number) {

    if (!this.alive) return;
    
    this._avoidanceForce = value;

    this.system.setBoidInputData(this.boidIndex, {
      avoidanceForce: this._avoidanceForce,
    });
  }

  public get externalForce() : Vector3 {
    return this._externalForce;
  }

  public set externalForce(value : Vector3) {

    if (!this.alive) return;

    this._externalForce = value;

    this.system.setBoidInputData(this.boidIndex, {
      externalForce: [this._externalForce.x, this._externalForce.y, this._externalForce.z, 0],
    });
  }

  public get diffuseColor() : Vector4 {
    return this._diffuseColor;
  }

  public set diffuseColor(value : Vector4) {

    if (!this.alive) return; 

    this._diffuseColor = value;
    this.system.setBoidInputData(this.boidIndex, {
      diffuseColor: [this._diffuseColor.x, this._diffuseColor.y, this._diffuseColor.z, this._diffuseColor.w],
    });
  }

  public get hasTarget() : boolean {
    return this._hasTarget;
  }

  public set hasTarget(value : boolean) {

    if (!this.alive) return;

    this._hasTarget = value;

    this.system.setBoidInputData(this.boidIndex, {
      hasTarget: this._hasTarget,
    });
  }

  public get speed() : number {
    return this._speed;
  }

  public set speed(value : number) {

    if (!this.alive) return;

    this._speed = value;
    this.system.setBoidInputData(this.boidIndex, {
      speed: this._speed,
    });
  }

  public get scale() : number {
    return this._scale;
  }

  public set scale(value : number) {

    if (!this.alive) return;

    this._scale = value;
    this.system.setBoidInputData(this.boidIndex, {
      scale: this._scale,
    });
  }

  public stop () {

    if (!this.alive) return;

    this.targetPosition = this.position;
    this.hasTarget = false;
  }

  //#endregion

  //#region == Memory Transfer ==
  setGPUData (boidOutputData : BoidOutputData) {
    if (!this.alive) return;
    this.transform.position.set(boidOutputData.position[0], boidOutputData.position[1], boidOutputData.position[2]);
  }

  getGPUInputData () : BoidInputData {
    if (!this.alive) return new BoidInputData();
    const boidInputData = new BoidInputData();
    boidInputData.targetPosition = [this._targetPosition.x, this._targetPosition.y, this._targetPosition.z, 0];
    boidInputData.externalForce = [this._externalForce.x, this._externalForce.y, this._externalForce.z, 0];
    boidInputData.diffuseColor = [this._diffuseColor.x, this._diffuseColor.y, this._diffuseColor.z, 0];
    boidInputData.hasTarget = this._hasTarget;
    boidInputData.speed = this._speed;
    boidInputData.scale = this._scale;
    boidInputData.avoidanceForce = this._avoidanceForce;
    console.log(boidInputData.avoidanceForce);
    return boidInputData;
  }

  //#endregion

  //#region == Game Logic == 



  //#region Movement

  public move (x: number, y: number) {
    // move in this direction
    const unitPos: Vector3 = this.position;

    let dir = new Vector3(x, y, 0);
    dir = dir.normalize();
    dir = dir.multiplyScalar(1000);

    const targetPos = unitPos.clone().add(dir);
    this.targetPosition = targetPos;
  }

  public moveTo (x: number, y: number) {
    const targetPos = new Vector3(x, y, this.position.z);
    this.targetPosition = targetPos;
  }


  //#endregion

  public getNeighbourIds () : Neighbour[] {
    const neighbours = this.system.getBoidNeighbours(this.id);
    return neighbours;
  }

  //#endregion

  public awake(): void {
    this.position = this.originalPosition;
    this.transform.position.set(this.originalPosition.x, this.originalPosition.y, this.originalPosition.z);
  }

}
