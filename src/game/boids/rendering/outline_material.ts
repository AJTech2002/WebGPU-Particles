import { StandardDiffuseMaterial, StandardMaterial } from "@engine/renderer/material";
import Scene from "@engine/scene";
import { vec2, vec3 } from "gl-matrix";
import MatrixShader from "@engine/renderer/shaders/matrix.wgsl";
import OutlineShader from "../shaders/outline.wgsl";
import { FloatUniform } from "@engine/renderer/uniforms";
import { Color } from "@engine/math/src";

export default class OutlineMaterial extends StandardDiffuseMaterial {

  private _outlineWidth: FloatUniform;

  constructor(scene: Scene, outlineWidth: number, outlineColor: Color, alphaMask: string) {
    super(
      scene, 
      alphaMask,
      MatrixShader + OutlineShader
    );
    this._outlineWidth = new FloatUniform(outlineWidth);
    this._outlineWidth.setup();

    this.color = outlineColor;
  }

  public set outlineWidth(width: number) {
    this._outlineWidth.value = width;
  }

  public get outlineWidth(): number {
    return this._outlineWidth.value;
  }

  public setupUniforms(): void {
    super.setupUniforms();
    this.setUniformEntry("outlineWidth", {
      binding: 5,
      resource: {
        buffer: this._outlineWidth.gpuBuffer
      }
    })
  }

}