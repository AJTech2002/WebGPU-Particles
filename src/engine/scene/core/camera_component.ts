import { mat4, vec4 } from "gl-matrix";
import Component from "@engine/scene/component";
import { EventfulComponent } from "./eventful_component";

export type CameraEvents = {
  "camera-change": void;
}

export default class CameraComponent extends EventfulComponent<CameraEvents> {
  public projection: mat4;

  private lastProjection: mat4;
  private lastView: mat4;

  private leftRightBottomTop: vec4;
  private cameraScale: number = 0.15;

  constructor() {
    super();
    this.projection = mat4.create();
    this.leftRightBottomTop = [-8, 8, -6, 6];
  }

  public get view(): mat4 {
    return this.gameObject.transform.worldModelMatrix;
  }

  public get extents(): vec4 {
    return this.leftRightBottomTop;
  }

  public set scale(value: number) {
    if (value != this.cameraScale) {
      this.emit("camera-change", undefined);
    }

    this.cameraScale = value;
  }

  public get scale(): number {
    return this.cameraScale;
  }

  private mat4Same(a: mat4, b: mat4): boolean {
    for (let i = 0; i < 16; i++) {
      if (a[i] !== b[i]) {
        return false;
      }
    }
    return true;
  }

  private updateCamera() {
    const windowWidth = this.scene.renderer.width / (this.cameraScale * this.scene.renderer.width);
    const windowHeight = this.scene.renderer.height / (this.cameraScale * this.scene.renderer.width);

    this.leftRightBottomTop = [-windowWidth, windowWidth, -windowHeight, windowHeight];
    mat4.ortho(this.projection, -windowWidth, windowWidth, -windowHeight, windowHeight, 0, 20);

    // check for camera camera-change
    if (!this.lastProjection || !this.lastView) {
      this.lastProjection = mat4.create();
      this.lastView = mat4.create();
    }

    if (!this.mat4Same(this.projection, this.lastProjection) || !this.mat4Same(this.view, this.lastView)) {
      this.emit("camera-change", undefined);
    }

    this.lastView = this.view;
    this.lastProjection = this.projection;

  }

  public update(dT: number): void {
    this.updateCamera();
  }

}
