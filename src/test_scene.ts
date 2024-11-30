import ParticleComputePass from "./pass/computepass";
import ParticleRenderPass from "./pass/renderpass";
import { Renderer } from "./core/engine/renderer";
import Scene from "./core/engine/scene";
import { QuadMesh } from "./particle_system";

export default class TestScene extends Scene {

  private particleMesh: QuadMesh;
  private particleRenderPass: ParticleRenderPass;
  private computePass: ParticleComputePass;

  constructor(renderer: Renderer) {
    super(renderer);

    this.particleRenderPass = new ParticleRenderPass(this.device, renderer.format);
    this.computePass = new ParticleComputePass(this.device, renderer.format);

    this.particleMesh = new QuadMesh(this.device, this.particleRenderPass, this, this.computePass);

    this.particleRenderPass.addMesh(this.particleMesh);
    this.computePass.addMesh(this.particleMesh);
  }

  render(commandEncoder: GPUCommandEncoder, context: GPUCanvasContext): void {
    super.render(commandEncoder, context);
    this.computePass.run(commandEncoder, context);
    this.particleRenderPass.run(commandEncoder, context);

  }

}