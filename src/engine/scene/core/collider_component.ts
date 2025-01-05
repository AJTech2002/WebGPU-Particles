import Component from "@engine/scene/component";
import { shaderProperty, ShaderTypes } from "@engine/ts-compute/datatypes";
import { vec3 } from "gl-matrix";

export enum ColliderShape {
  Square = 0,
  Circle = 1,
}

export default class Collider extends Component {

  public isTrigger: boolean = false;
  public isStatic: boolean = false;

  @shaderProperty(ShaderTypes.vec3)
  public center: vec3 = [0,0,0];

  @shaderProperty(ShaderTypes.vec3)
  public size: vec3 = [1,1,1];

  @shaderProperty(ShaderTypes.u32)
  public shape: ColliderShape = ColliderShape.Square;
  
  constructor() {
    super();
  }

  awake() {
  }

  start() {
  }

  update(deltaTime: number) {
  }

  render(deltaTime: number) {
  }

  destroy() {
  }

}

