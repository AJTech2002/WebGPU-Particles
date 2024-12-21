import Scene from "@engine/scene";

export default class Component {

  private scene: Scene;
  
  constructor(scene: Scene) {
    this.scene = scene;
  }

  public awake() {
    console.log("Component awake");
  }

  public start() {
    console.log("Component start");
  }

  public render(dT: number) {
    console.log("Component render");
  }

  public destroy() {
    console.log("Component destroy");
  }

}