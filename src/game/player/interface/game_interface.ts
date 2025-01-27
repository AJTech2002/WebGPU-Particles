import { BoidInterface } from "@game/player/interface/boid_interface";
import { GameDataBridge } from "./bridge";
import { Vector3 } from "@engine/math/src";

export class GameContext {

  private bridge: GameDataBridge;

  constructor(bridge: GameDataBridge) {
    this.bridge = bridge;
  }

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
