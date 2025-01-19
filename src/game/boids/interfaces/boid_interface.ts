import BoidSystemComponent from "../boid_system";
import BoidInstance from "../boid_instance";
import { Vector3 } from "@engine/math/src";

// Scene Facing
export class BoidInterface {

  private boidInstance: BoidInstance;
  private boidSystem: BoidSystemComponent;
  public __origColor__: Vector3 = new Vector3(1,1,1);

  private _id : number = 0;

  constructor(instance: BoidInstance, component: BoidSystemComponent) {
    this.boidSystem = component;
    this.boidInstance = instance;

    this._id = this.boidInstance.id;
  }

  
  public get id () : number {
    return this._id;
  }

  public get position(): Vector3 {
    return this.boidInstance.position;
  }

  public get alive () : boolean {
    return this.boidInstance.alive;
  }

  public kill() {
    this.boidInstance.takeDamage(1000);
  }

  public move (x: number, y: number) {
    // move in this direction
    const unitPos: Vector3 = this.position;

    let dir = new Vector3(x, y, 0);
    dir = dir.normalize();
    dir = dir.multiplyScalar(1000);

    const targetPos = unitPos.clone().add(dir);
    this.boidInstance.targetPosition = targetPos;
  }

  public moveTo (x: number, y: number) {
    const targetPos = new Vector3(x, y, 0);
    this.boidInstance.targetPosition = targetPos;
  }

  public stop() {
    this.boidInstance.targetPosition = this.position;
    this.boidInstance.hasTarget = false;
  }

  public attack (x: number, y: number) {
    this.boidInstance.attack(x, y);
  }
}
