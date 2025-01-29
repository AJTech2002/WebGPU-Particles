import Component from "@engine/scene/component";
import { mat4 } from "gl-matrix";
import { shaderProperty, shaderStruct, ShaderTypes } from "@engine/ts-compute/datatypes";
import { vec3 } from "gl-matrix";
import BoidSystemComponent from "@game/boids/boid_system";
import { Plane, Vector2, Vector3 } from "@engine/math/src";
import { line2DIntersectsRotatedSquare } from "@engine/utils/intersections";

export enum ColliderShape {
  Square = 0,
  Circle = 1,
}

@shaderStruct("Collider")
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
    super.awake();
  }

  override start() {
    super.start();
    this.scene.findObjectOfType<BoidSystemComponent>(BoidSystemComponent)!.addCollider(this);
  }

  

  check2DRayIntersection(
    rayOrigin: vec3,
    rayDirection: vec3,
    rayDistance: number,
  ) : boolean {
    
    if (this.isStatic) {
      return false;
    }

    if (this.shape === ColliderShape.Square) {
      const origin = new Vector2(rayOrigin[0], rayOrigin[1]);
      const direction = new Vector2(rayDirection[0], rayDirection[1]);
      const end = origin.clone().add(direction.multiplyScalar(rayDistance));

      const didIntersect = line2DIntersectsRotatedSquare(
        new Vector2(this.transform.position.x, this.transform.position.y),
        this.size[0],
        this.transform.rotation.z,
        origin,
        end,
      );
      
      return didIntersect;
    }
    else if (this.shape === ColliderShape.Circle) {
      //TODO: Implement circle intersection
      return false;
    }

    return false;
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

