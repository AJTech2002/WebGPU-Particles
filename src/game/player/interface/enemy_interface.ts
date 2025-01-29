import { Vector3 } from "@engine/math/src";
import { GameDataBridge } from "./bridge";
import { EnemyInterfaceData } from "./bridge_commands";
import { GameInterface } from "./game_interface";

export class EnemyInterface extends GameInterface {

  private _id : number = 0;

  constructor(id: number, bridge: GameDataBridge) {
    super(bridge);
    this._id = id;
  }

  public get id () : number {
    return this._id;
  }

  private get data () : EnemyInterfaceData {
    return this.bridge.getEnemyData(this.id);
  }

  public get unitType () : string {
    return this.data.unitType;
  }

  public get ownerId () : number {
    return this.data.ownerId;
  }

  public get position() : Vector3 {
    return this.data.position;
  }

  public get alive () : boolean {
    return this.data.alive;
  }

  public get health () : number {
    return this.data.health;
  }

}