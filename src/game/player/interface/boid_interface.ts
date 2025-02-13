import { Vector3 } from "@engine/math/src";
import { GameDataBridge } from "@game/player/interface/bridge";
import { BoidInterfaceData } from "@game/player/interface/bridge_commands";
import { UnitType } from "@game/squad/squad";
import { GameInterface } from "./game_interface";
import { EnemyInterface } from "./enemy_interface";
import { Neighbour } from "@game/boids/boid_system";

type Positional = {
  position: Vector3;
}
// Scene Facing
export class BoidInterface extends GameInterface {

  private _id : number = 0;
  private mappedInterfaces : Map<number, BoidInterface | EnemyInterface> = new Map();

  constructor(id: number, bridge: GameDataBridge) {
    super(bridge);
    this._id = id;
  }

  private get data () : BoidInterfaceData {
    return this.bridge.getBoidData(this.id);
  }
  
  public get id () : number {
    return this._id;
  }

  public get unitType () : UnitType {
    return this.data.unitType;
  }

  public get ownerId () : number {
    return this.data.ownerId;
  }

  public get position(): Vector3 {
    return this.data.position;
  }

  public get alive () : boolean {
    return this.data.alive;
  }

  public get neighbours () : Neighbour[] {
    return this.data.neighbours;
  }

  public get friendlyNeighbours () : BoidInterface[] {
    // return this.neighbours.filter((boid) => boid.id !== this.id && boid.alive && (this.bridge.getBoidData(boid.id).ownerId === this.ownerId));
    const _neighbours : BoidInterface[] = [] as BoidInterface[];
    
    for (const neighbour of this.neighbours) {

      if (neighbour.id === this.id || neighbour.ownerId !== this.ownerId) continue;

      let foundBoid : BoidInterface | undefined;
      const id = neighbour.id;
      
      if (this.mappedInterfaces.has(id)) {
        const boid = this.mappedInterfaces.get(id);
        if (boid instanceof BoidInterface) {
          foundBoid = boid;
        }
      }
      else {
        const boidData = this.bridge.getBoidData(id);
        if (boidData.ownerId === this.ownerId) {
          const boid = new BoidInterface(id, this.bridge);
          this.mappedInterfaces.set(id, boid);
          foundBoid = boid;
        }
      }

      if (foundBoid && foundBoid.alive) {
        _neighbours.push(foundBoid);
      }

    }

    return _neighbours;
  }

  public get enemyNeighbours () : EnemyInterface[] {
    // return this.neighbours.filter((boid) => boid.id !== this.id && boid.alive && (this.bridge.getBoidData(boid.id).ownerId === this.ownerId));
    const _neighbours : EnemyInterface[] = [] as EnemyInterface[];
    
    for (const neighbour of this.neighbours) {

      if (neighbour.id === this.id || neighbour.ownerId === this.ownerId) continue;

      let foundBoid : EnemyInterface | undefined;
      const id = neighbour.id;
      
      if (this.mappedInterfaces.has(id)) {
        const boid = this.mappedInterfaces.get(id);
        if (boid instanceof EnemyInterface) {
          foundBoid = boid;
        }
      }
      else {
        const boidData = this.bridge.getBoidData(id);
          const boid = new EnemyInterface(id, this.bridge);
          this.mappedInterfaces.set(id, boid);
          foundBoid = boid;
      }

      if (foundBoid && foundBoid.alive) {
        _neighbours.push(foundBoid);
      }

    }

    return _neighbours;
  }

  public getClosest<Positional> (units: Positional[]) : Positional | null {
    let minDist = Number.MAX_VALUE;
    let closest: Positional | null = null;
    for (const unit of units) {
      const dist = this.position.distanceTo((unit as any).position);
      if (dist < minDist) {
        minDist = dist;
        closest = unit;
      }
    }

    return closest;
  }

  public getClosestEnemy () : EnemyInterface | null {
    const closest = this.getClosest(this.enemyNeighbours);
    return closest ? new EnemyInterface(closest.id, this.bridge) : null;
  }

  public kill() {
    // this.boidInstance.takeDamage(1000);
    this.bridge.sendCommand(
      {
        id: this.id,
        type: "Terminate",
      }
    )
  }

  public move (x: number, y: number) {
    this.bridge.sendCommand(
      {
        id: this.id,
        type: "Move",
        props: {
          vec: new Vector3(x, y, 0),
          dir: true
        }
      }
    )
  }

  public moveTo (x: number, y: number, distanceThreshold?: number) {
    const targetPos = new Vector3(x, y, 0);
    this.bridge.sendCommand(
      {
        id: this.id,
        type: "Move",
        props: {
          vec: targetPos,
          dir: false
        }
      }
    )
  }

  public stop() {
    this.bridge.sendCommand(
      {
        id: this.id,
        type: "Stop",
      }
    )
  }

  public attack (target: Positional) {
    const dir = target.position.clone().sub(this.position);
    dir.normalize();
    this.attack_dir(dir.x, dir.y);
  }

  public attack_dir (x: number, y: number) {
    this.bridge.sendCommand(
      {
        id: this.id,
        type: "Attack",
        props: {
          direction: new Vector3(x, y, 0)
        }
      }
    )
  }
}
