import { Euler, Matrix4, Quaternion, Vector3, Vector4 } from "@engine/math/src"
import Component from "../component";
import GameObject from "../gameobject";
import { mat4, quat } from "gl-matrix";


export default class TransformComponent extends Component {
  //[prop position vec3]
  public position: Vector3 = new Vector3(0, 0, 0);
  //[prop scale vec3]
  public scale: Vector3 = new Vector3(1, 1, 1);  
  private _quaternion: Quaternion = new Quaternion();
  private _eulerFromQ: Euler = new Euler();
  
  public matrix: Matrix4 | null;

  constructor() {
    super();
    this.matrix = new Matrix4().identity();
    this.updateTransform();
  }

  public updateTransform() {
    this.matrix = new Matrix4();
    this.matrix.compose(
      this.position.clone(),
      this._quaternion.clone(),
      this.scale.clone()
    );
  }

  rotateOnAxis(axis: Vector3, angle: number) {
    const newQuat = new Quaternion()
      .setFromAxisAngle(axis.normalize(), angle)
      .normalize();
    this._quaternion = this._quaternion.multiply(newQuat).normalize();
  }

  localRotateOnAxis(axis: Vector3, angle: number) {
    // Normalize the axis
    axis.normalize();
  
    // Create a new quaternion for the rotation
    const newQuat = new Quaternion().setFromAxisAngle(axis, angle).normalize();
  
    // Rotate the current quaternion
    this._quaternion = this._quaternion.multiply(newQuat).normalize();
  
    // Rotate the position around the local pivot
    const pivot = this.position.clone(); // Use the object's current position as the local pivot
    pivot.applyQuaternion(newQuat.invert()); // Apply the local rotation to the position
    this.position.copy(pivot); // Update the position
  }

  getEulerRotation(): Euler {
    return this._eulerFromQ;
  }

  setRotationFromEuler(euler: Euler) {
    this._quaternion.setFromEuler(euler.clone());
  }

  public get rotation (): Euler {
    return this._eulerFromQ;
  }

  public get quaternion(): Quaternion {
    return this._quaternion;
  }

  public set quaternion(quat: Quaternion) {
    this._quaternion = quat;
    this._eulerFromQ.setFromQuaternion(quat);
  }

  public set rotation(euler: Euler) {
    this._eulerFromQ = euler;
    this._quaternion.setFromEuler(euler);
  }

  public lookAt(target: Vector3, axis: Vector3) {
    this._quaternion.setFromUnitVectors(axis, target.clone().normalize());
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
    if (!this.matrix) return this._eulerFromQ;
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
 

 
    mat4.fromRotationTranslation(m, [worldR.x, worldR.y, worldR.z, worldR.w], [worldP.x, worldP.y, worldP.z]);

    mat4.scale(m, m, [worldS.x, worldS.y, worldS.z]);
    // Apply rotation next
    //const quatMat = mat4.create();
    // mat4.fromQuat(quatMat, [worldR.x, worldR.y, worldR.z, worldR.w]);
    // mat4.multiply(m, quatMat, m); // Order: rotation * scale
  
    // Apply translation last
  
    return m;
  }

  override awake() {
    this._quaternion.setFromEuler(this._eulerFromQ).normalize();
  }

  override update() {
    
    // this.quaternion.setFromEuler(this.euler).normalize();
    this.updateTransform();


    if (this.matrix && this.gameObject.parent?.transform?.matrix) {
      this.matrix.copy(
        this.matrix.premultiply(this.gameObject.parent.transform.matrix)
      );
    }
  }
}
