import { vec3 } from "gl-matrix";
import BoidSystemComponent from "../boid_system";

export class BoidInterface {

  public boidId: number;
  private boidSystem: BoidSystemComponent;

  private initialPosition: vec3;
  public __origColor__: vec3 = vec3.create();

  constructor(component: BoidSystemComponent, boidId: number, position: vec3) {
    this.boidSystem = component;
    this.boidId = boidId;
    this.initialPosition = position;
  }

  public get position(): vec3 {
    return this.boidSystem.getBoidInfo(this.boidId)?.data.position ?? vec3.create(); 
  }

  public get target(): vec3 {
    // const v4 = this.boidSystem.getBoidInfo(this.boidId)?.data.targetPosition ?? vec3.create();
    // const v3 = vec3.fromValues(v4[0], v4[1], v4[2]);
    // return v3;
    //TODO
    return [0,0,0];
  }

  public get color(): vec3 {
    // return this.boidSystem.getBoidInfo(this.boidId)?.object.diffuseColor ?? vec3.create();
    return this.__origColor__;
  }

  public set target(target: vec3) {
    this.boidSystem.setBoidTarget(this.boidId, target);
  }

  public attack (x: number, y: number) {
    // get the neighbours 
    this.boidSystem.attack(this.boidId, x, y); 
  }

  public move (x: number, y: number) {
    // move in this direction
    let unitPos = vec3.create();

    if (this.boidSystem.getBoidInfo(this.boidId) == null) {
      unitPos = this.initialPosition;
    }
    else {
      // check if the position is NaN
      if (isNaN(this.position[0]))
        unitPos = this.initialPosition;
      else
        unitPos = this.position;
    }

    const dir = vec3.fromValues(x, y, 0);
    vec3.normalize(dir, dir);
    vec3.scale(dir, dir, 1000);

    const targetPos = vec3.create();
    vec3.add(targetPos, unitPos, dir);

    this.boidSystem.setBoidTarget(this.boidId, targetPos);
  }


  public moveTo (x: number, y: number) {
    const targetPos = vec3.fromValues(x, y, 0);
    this.boidSystem.setBoidTarget(this.boidId, targetPos);
  }
}
