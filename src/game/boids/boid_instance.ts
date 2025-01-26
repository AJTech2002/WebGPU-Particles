import Component from "@engine/scene/component";
import { BoidInputData, BoidOutputData } from "./boid_compute";
import { Vector3, Vector4 } from "@engine/math/src";
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
  private _diffuseColor : Vector4 = new Vector4();
  private _hasTarget : boolean = false;
  private _speed : number = 0.0;
  private _scale : number = 0.0;

  // Game Logic
  private originalColor: Vector4 = new Vector4(1, 1, 1);
  private originalScale: number = 0.0;
  private originalPosition: Vector3 = new Vector3();
  private _health: number = 100;

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

  public get health () : number {
    return this._health;
  }

  public get alive () : boolean {
    return this._health > 0;
  }

  public get position () : Vector3 {
    return new Vector3(this.transform.position.x, this.transform.position.y, this.transform.position.z);
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
      diffuseColor: [this._diffuseColor.x, this._diffuseColor.y, this._diffuseColor.z, 1.0],
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

    this.system.setBoidInputData(this.boidIndex, {
      speed: this._speed,
    });
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

    return boidInputData;
  }

  //#endregion

  //#region == Game Logic == 

  private colorPalette: vec3[] = [
    // [102.0/255.0, 172.0/255.0, 204.0/255.0],
    [150.0/255.0, 150.0/255.0, 150.0/255.0],
    [243.0/255.0, 131.0/255.0, 85.0/255.0],
    // [110.0/255.0, 110.0/255.0, 110.0/255.0],
    //#2a2734
    [42.0/255.0, 39.0/255.0, 52.0/255.0],
    //#6c6783
    // [108.0/255.0, 103.0/255.0, 131.0/255.0],
    // //#242424
    // [36.0/255.0, 36.0/255.0, 36.0/255.0],
  ];

  async setUnitColor () {
    await this.scene.seconds(0.1);
    const boidColor = this.colorPalette[Math.floor(Math.random() * this.colorPalette.length)];
    this.diffuseColor = new Vector4(boidColor[0], boidColor[1], boidColor[2], 1.0);
    this.originalColor = new Vector4(boidColor[0], boidColor[1], boidColor[2], 1.0);
  }

  async knockbackForce (id: number, force: Vector3) {
    this.externalForce = new Vector3(force.x, force.y, force.z);
    this.diffuseColor = new Vector4(1, 1, 1, 1);
    this.scale = this.originalScale * 1.2;

    await this.scene.seconds(Math.random() * 0.1 + 0.05);

    this.diffuseColor = this.originalColor;
    this.externalForce = new Vector3(0, 0, 0);
    this.scale = this.originalScale;
  }


  private async die() {
    let t = 0;
    const deathTime = 0.1;
    this.scene.runLoopForSeconds(deathTime, (dT) => {
      t += dT/deathTime/1000;
      let scale = this.originalScale * (1 - t);
      this.system.setBoidInputData(this.boidIndex, {
        scale: scale,
      });
    }, () => {
      this.system.setBoidInputData(this.boidIndex, {
        scale: 0,
        diffuseColor: [0, 0, 0, 0],
      });
    });
  }

  public takeDamage (damage: number) {

    if (!this.alive) return;

    this._health -= damage;
    if (this._health <= 0) {
      this.system.setBoidInputData(this.boidIndex, {
        alive: false,
      }) 

      this.die();
    }
  }

  public getNeighbours() : BoidInstance[] {
    if (!this.alive) return [];
    const neighbours = this.system.getBoidNeighbours(this.id);
    return this.system.boidIdsToBoids(neighbours) as BoidInstance[];
  }

  private lastAttackTime: number = 0;

  public attack (x: number, y: number) {

    if (!this.alive) return;

    const now = Date.now();
    if (now - this.lastAttackTime < 400) return;

    this.lastAttackTime = now;

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
        if (dot > 0.6 ) {
          // set external force away from the boid
          const force = new Vector3();
          force.copy(boidDir).multiplyScalar(0.2);
          boids[i].knockbackForce(boids[i].boidId, force);
          boids[i].takeDamage( 10 );
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
