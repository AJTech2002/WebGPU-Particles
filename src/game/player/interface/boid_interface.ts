import { Vector3 } from "@engine/math/src";
import { GameDataBridge } from "@game/player/interface/bridge";
import { BoidInterfaceData } from "@game/player/interface/bridge_commands";
import { UnitType } from "@game/squad/squad";
import { GameInterface } from "./game_interface";
import { EnemyInterface } from "./enemy_interface";

type Positional = {
  position: Vector3;
}
// Scene Facing
export class BoidInterface extends GameInterface {

  private _id : number = 0;

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

  private interfacesFromIds (ids: number[]) : BoidInterface[] {
    return ids.map((id) => new BoidInterface(id, this.bridge));
  }

  public get neighbours () : BoidInterface[] {
    return this.interfacesFromIds(this.data.neighbours);
  }

  public get friendlyNeighbours () : BoidInterface[] {
    return this.neighbours.filter((boid) => boid.id !== this.id && boid.alive && (this.bridge.getBoidData(boid.id).ownerId === this.ownerId));
  }

  public get enemyNeighbours () : EnemyInterface[] {
    return this.neighbours
    .filter((boid) => boid.id !== this.id && boid.alive && (this.bridge.getBoidData(boid.id).ownerId !== this.ownerId))
    .map((boid) => new EnemyInterface(boid.id, this.bridge));
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

  public async moveTo (x: number, y: number, distanceThreshold?: number) {
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

    await this.bridge.until(() => {
      return this.position.distanceTo(targetPos) < (distanceThreshold ?? 0.15);
    })
  }

  public stop() {
    
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
