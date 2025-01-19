import BoidInstance from "../boid_instance";
import { Vector3 } from "@engine/math/src";
import BoidScene from "src/game/boid_scene";

// Scene Facing
export class BoidInterface {

  private boidInstance: BoidInstance;
  private boidScene: BoidScene;
  public __origColor__: Vector3 = new Vector3(1,1,1);

  private _id : number = 0;

  constructor(instance: BoidInstance, component: BoidScene) {
    this.boidScene = component;
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

  public get friendlyNeighbours () : BoidInterface[] {
    const neighbours = this.boidInstance.getNeighbours();
    return neighbours.filter((boid) => boid.id !== this.id && boid.alive).map((boid) => this.boidScene.getUnit(boid.id));
  }

  public get closestFriendlyNeighbour () : BoidInterface | undefined {
   
    const friendlyNeighbours = this.friendlyNeighbours;
    if (friendlyNeighbours.length == 0) return undefined;

    let closest = friendlyNeighbours[0];
    let closestDist = this.position.distanceTo(closest.position);

    for (let i = 1; i < friendlyNeighbours.length; i++) {
      const dist = this.position.distanceTo(friendlyNeighbours[i].position);
      if (dist < closestDist) {
        closest = friendlyNeighbours[i];
        closestDist = dist;
      }
    }

    return closest;
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

  public attack (target: BoidInterface) {
    const dir = target.position.clone().sub(this.position);
    dir.normalize();
    this.attack_dir(dir.x, dir.y);
  }

  public attack_dir (x: number, y: number) {
    this.boidInstance.attack(x, y);
  }
}
