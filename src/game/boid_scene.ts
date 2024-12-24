import Engine from "@engine/engine";
import Scene from "@engine/scene";
import GameObject from "@engine/scene/gameobject";
import BoidComponent from "./boids/boid_component";

export default class BoidScene extends Scene {

  awake(engine: Engine): void {
    super.awake(engine);

    const boids = new GameObject("boids", this);
    boids.addComponent(new BoidComponent());
  }

}