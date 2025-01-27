import { Vector3 } from "@engine/math/src";
import { GameDataBridge } from "@game/player/interface/bridge";
import { BoidInterfaceData } from "@game/player/interface/bridge_commands";
import { UnitType } from "@game/squad/squad";

// Scene Facing
export class BoidInterface {

  private bridge: GameDataBridge;
  private _id : number = 0;

  constructor(id: number, bridge: GameDataBridge) {
    this._id = id;
    this.bridge = bridge;
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

  public get enemyNeighbours () : BoidInterface[] {
    return this.neighbours.filter((boid) => boid.id !== this.id && boid.alive && (this.bridge.getBoidData(boid.id).ownerId === this.ownerId));
  }

  public getClosest (units: BoidInterface[]) : BoidInterface | null {
    let minDist = Number.MAX_VALUE;
    let closest: BoidInterface | null = null;
    for (const unit of units) {
      const dist = this.position.distanceTo(unit.position);
      if (dist < minDist) {
        minDist = dist;
        closest = unit;
      }
    }

    return closest;
  }

  public kill() {
    // this.boidInstance.takeDamage(1000);
    this.bridge.sendCommand(
      {
        id: this.id,
        type: "TakeDamage",
        props: {
          damage: 1000
        }
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

  public attack (target: BoidInterface) {
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
