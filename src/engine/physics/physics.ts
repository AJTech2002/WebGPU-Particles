import Scene from "@engine/scene";
import { Rigidbody } from "./rigidbody";

export class Physics {

  private rigidbodies: Rigidbody[] = [];
  private scene: Scene;

  constructor(scene: Scene) {
    this.scene = scene;
  }

  public addRigidbody(rigidbody: Rigidbody) {
    this.rigidbodies.push(rigidbody);
  }

}