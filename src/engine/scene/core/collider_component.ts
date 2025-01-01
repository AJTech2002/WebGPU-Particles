import Component from "@engine/scene/component";

export default class Collider extends Component {

  public isTrigger: boolean = false;
  public isStatic: boolean = false;

  constructor() {
    super();
  }

  awake() {
    console.log("Collider awake");
  }

  start() {
    console.log("Collider start");
  }

  update(deltaTime: number) {
    console.log("Collider update");
  }

  render(deltaTime: number) {
    console.log("Collider render");
  }

  destroy() {
    console.log("Collider destroy");
  }

}
