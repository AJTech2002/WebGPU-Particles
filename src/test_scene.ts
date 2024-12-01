import ParticleComputePass from "./pass/computepass";
import ParticleRenderPass from "./pass/renderpass";
import { Renderer } from "./core/engine/renderer";
import Scene from "./core/engine/scene";
import { QuadMesh } from "./particle_system";
import { vec3, vec4 } from "gl-matrix";

export default class TestScene extends Scene {
  private particleMesh: QuadMesh;
  private particleRenderPass: ParticleRenderPass;
  private computePass: ParticleComputePass;
  private mousePosWorld: vec3 | undefined;

  constructor(renderer: Renderer) {
    super(renderer);

    this.particleRenderPass = new ParticleRenderPass(
      this.device,
      renderer.format
    );
    this.computePass = new ParticleComputePass(this.device, renderer.format);

    this.particleMesh = new QuadMesh(
      this.device,
      this.particleRenderPass,
      this,
      this.computePass
    );

    this.particleRenderPass.addMesh(this.particleMesh);
    this.computePass.addMesh(this.particleMesh);

    setTimeout(() => {
      window.addEventListener("mousemove", (e) => {
        var rect = this.renderer.canvas.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;
        this.mousePosWorld = this.mouseToWorld(x, y, -10);
      });
    }, 1000);
  }

  mouseToWorld = (x: number, y: number, z: number): vec3 => {
    var bounds : vec4 = this.cameraData.leftRightBottomTop;
    var width = this.renderer.canvas.width;
    var height = this.renderer.canvas.height;
    var xNDC = x / width;
    var yNDC = 1 - ( y / height);
    var xWorld = bounds[0] + (bounds[1] - bounds[0]) * xNDC;
    var yWorld = bounds[2] + (bounds[3] - bounds[2]) * yNDC;
    var zWorld = 0;
    return vec3.fromValues(xWorld, yWorld, z);
  };

  render(commandEncoder: GPUCommandEncoder, context: GPUCanvasContext): void {
    super.render(commandEncoder, context);

    if (this.mousePosWorld) {
      this.particleMesh.setBoidTarget(this.mousePosWorld, 0);
      this.particleMesh.updateBoidBuffer();
    }

    this.computePass.run(commandEncoder, context);
    this.particleRenderPass.run(commandEncoder, context);
  }
}
