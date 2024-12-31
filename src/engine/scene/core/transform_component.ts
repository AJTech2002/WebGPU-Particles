import { Euler, Matrix4, Quaternion, Vector3, Vector4 } from "@math";
import Component from "../component";
import GameObject from "../gameobject";
import { mat4, quat } from "gl-matrix";


export default class TransformComponent extends Component {
  //[prop position vec3]
  public position: Vector3 = new Vector3(0, 0, 0);
  //[prop rotation eul3]
  private rotation: Euler = new Euler(0, 0, 0);
  //[prop scale vec3]
  public scale: Vector3 = new Vector3(1, 1, 1);
  public quaternion: Quaternion = new Quaternion();
  public matrix: Matrix4 | null;

  constructor() {
    super();
    this.matrix = new Matrix4().identity();
    this.updateTransform();
  }

  updateTransform() {
    this.matrix = new Matrix4();
    this.matrix.compose(
      this.position.clone(),
      this.quaternion.clone(),
      this.scale.clone()
    );
  }

  rotateOnAxis(axis: Vector3, angle: number) {
    let newQuat = new Quaternion()
      .setFromAxisAngle(axis.normalize(), angle)
      .normalize();
    this.quaternion = this.quaternion.multiply(newQuat).normalize();
  }

  localRotateOnAxis(axis: Vector3, angle: number) {
    // Normalize the axis
    axis.normalize();
  
    // Create a new quaternion for the rotation
    const newQuat = new Quaternion().setFromAxisAngle(axis, angle).normalize();
  
    // Rotate the current quaternion
    this.quaternion = this.quaternion.multiply(newQuat).normalize();
  
    // Rotate the position around the local pivot
    const pivot = this.position.clone(); // Use the object's current position as the local pivot
    pivot.applyQuaternion(newQuat.invert()); // Apply the local rotation to the position
    this.position.copy(pivot); // Update the position
  }

  getEulerRotation(): Euler {
    return this.rotation;
  }

  setRotationFromEuler(euler: Euler) {
    this.quaternion.setFromEuler(euler.clone());
  }

  getForwardVector(): Vector3 {
    return this.transformVector(new Vector3(0, 0, -1), true);
  }

  transformVector(vector: Vector3, isDirection: boolean): Vector3 {
    const vec4: Vector4 = new Vector4(
      vector.x,
      vector.y,
      vector.z,
      isDirection ? 0 : 1
    );
    vec4.applyMatrix4(this.matrix as Matrix4);
    return new Vector3(vec4.x, vec4.y, vec4.z);
  }

  public get worldPosition(): Vector3 {
    if (!this.matrix) return this.position;
    const outputPosition = new Vector3().setFromMatrixPosition(
      this.matrix
    );
    return outputPosition;
  }

  public get worldRotation(): Euler {
    if (!this.matrix) return this.rotation;
    const outputRotation = new Euler().setFromRotationMatrix(this.matrix);
    return outputRotation;
  }

  public get worldScale(): Vector3 {
    if (!this.matrix) return this.scale;
    const outputScale = new Vector3().setFromMatrixPosition(this.matrix);
    return outputScale;
  }

  public get worldModelMatrix(): mat4 {
    const worldP = new Vector3();
    const worldR = new Quaternion();
    const worldS = new Vector3();
  
    // Decompose the matrix into position, rotation, and scale
    this.matrix?.decompose(worldP, worldR, worldS);
  
    // Create an identity matrix
    const m = mat4.create();
  
    // Apply scale first
    mat4.scale(m, m, [worldS.x, worldS.y, worldS.z]);
  
    // Apply rotation next
    const quatMat = mat4.create();
    mat4.fromQuat(quatMat, [worldR.x, worldR.y, worldR.z, worldR.w]);
    mat4.multiply(m, quatMat, m); // Order: rotation * scale
  
    // Apply translation last
    mat4.translate(m, m, [worldP.x, worldP.y, worldP.z]);
  
    return m;
  }

  override awake() {
    this.quaternion.setFromEuler(this.rotation).normalize();
  }

  override update() {
    this.updateTransform();
    this.rotation.setFromQuaternion(this.quaternion);

    if (this.matrix && this.gameObject.parent?.transform?.matrix) {
      this.matrix.copy(
        this.matrix.premultiply(this.gameObject.parent.transform.matrix)
      );
    }
  }
}
