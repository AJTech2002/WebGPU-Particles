import Component from "@engine/scene/component";
import { mat4 } from "gl-matrix";
import { shaderProperty, ShaderTypes } from "@engine/ts-compute/datatypes";
import { vec3 } from "gl-matrix";
import CameraComponent from "./camera_component";

export enum ColliderShape {
  Square = 0,
  Circle = 1,
}

export default class Collider extends Component {

  public isTrigger: boolean = false;
  public isStatic: boolean = false;

  @shaderProperty(ShaderTypes.mat4x4)
  public model: mat4 = mat4.create();

  @shaderProperty(ShaderTypes.mat4x4)
  public inverted: mat4 = mat4.create();

  @shaderProperty(ShaderTypes.vec3)
  public size: vec3 = [1,1,1];

  @shaderProperty(ShaderTypes.u32)
  public shape: ColliderShape = ColliderShape.Square;
  
  constructor(
    size: vec3 = [1,1,1],
    shape: ColliderShape = ColliderShape.Square,
    isTrigger: boolean = false,
    isStatic: boolean = false,
  ) {
    super();
    this.size = size;
    this.shape = shape;
    this.isTrigger = isTrigger;
    this.isStatic = isStatic;
  }

  awake() {
  }

  start() {
  }

  update(deltaTime: number) {
    this.model = this.transform.worldModelMatrix;
    this.inverted = mat4.invert(mat4.create(), this.model);
  }

  render(deltaTime: number) {
  }

  destroy() {
  }

}

