import { BoidInterface } from "@game/player/interface/boid_interface";
import { GameDataBridge } from "./bridge";
import { Vector3 } from "@engine/math/src";

export class GameInterface {
  
  protected bridge: GameDataBridge;

  constructor(bridge: GameDataBridge) {
    this.bridge = bridge;
  }

}

export class GameContext extends GameInterface {

  public get mousePosition() : Vector3 {
    return this.bridge.mousePosition;
  }

  public get units() : BoidInterface[] {
    return this.bridge.boidInterfaces;
  }

  public getUnit (index: number) : BoidInterface {
    return this.bridge.getBoidInterface(index);
  }

}
