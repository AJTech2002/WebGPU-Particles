import ParticleComputePass from "./pass/computepass";
import ParticleRenderPass from "./pass/renderpass";
import { Renderer } from "./core/engine/renderer";
import Scene from "./core/engine/scene";
import { InstancedQuadMesh } from "./particle_system";
import { vec3, vec4 } from "gl-matrix";

export default class ParticleScene extends Scene {
  protected particleMesh: InstancedQuadMesh;
  private particleRenderPass: ParticleRenderPass;
  private computePass: ParticleComputePass;
  public mousePosWorld: vec3 | undefined;

  constructor(renderer: Renderer) {
    super(renderer);

    this.particleRenderPass = new ParticleRenderPass(
      this.device,
      renderer.format
    );
    this.computePass = new ParticleComputePass(this.device, renderer.format);

    this.particleMesh = new InstancedQuadMesh(
      this.device,
      this.particleRenderPass,
      this,
      this.computePass
    );

    this.setupParticles();

    // setTimeout(() => {

    //   let isMouseDown = false;
    //   let mouseX = 0;
    //   let mouseY = 0;
      
    //   window.addEventListener("mousedown", (e) => {
    //     isMouseDown = true;
    //     startLoop();
    //   });
      
    //   window.addEventListener("mouseup", () => {
    //     isMouseDown = false;
    //     this.particleMesh.updateBuffers();
    //     this.particleMesh.updateBoidBuffer();
    //   });
      
    //   window.addEventListener("mousemove", (e) => {
    //     mouseX = e.clientX;
    //     mouseY = e.clientY;
    //   });
      
    //   const startLoop = () => {
    //     const loop = () => {
    //       if (isMouseDown) {
    //         // Use current mouseX, mouseY
    //         this.mousePosWorld = this.mouseToWorld({ clientX: mouseX, clientY: mouseY }, -10);
            
    //         for (let i = 0; i < 3; i++) {
    //           console.log("Adding guy");

    //           const randomScatter = vec3.fromValues(
    //             Math.random() * 0.2 - 0.1, Math.random() * 0.2 - 0.1, 0);

    //           this.particleMesh.addGuy(vec3.add(vec3.create(), this.mousePosWorld, randomScatter));
    //         }
      
    //         requestAnimationFrame(loop); // Continue loop while mouse is down
    //       }
    //     };
    //     loop();
    //   };

    

      
    // }, 50);
  }

  async setupParticles() {
    await this.particleMesh.init();
    this.computePass.addMesh(this.particleMesh);
    this.particleRenderPass.addMesh(this.particleMesh);
  }

  mouseToWorld = (e : any, z: number): vec3 => {
    var rect = this.renderer.canvas.getBoundingClientRect();
    var x = e.clientX - rect.left;
    var y = e.clientY - rect.top;
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
      
      for (let i = 0; i < this.particleMesh.boids.length; i++) {

        // pick a random value between 0 to 100 and if less than 20 then scatter
        if (Math.random() * 100 > 20) {
          continue;
        }

        var scatter = vec3.fromValues(
          Math.random() * 5  - 2.5, Math.random()  * 5 - 2.5, 0);
          

        // this.particleMesh.setBoidTarget(vec3.add(vec3.create(), this.mousePosWorld, scatter), i);
      }

      this.particleMesh.updateBuffers();
        this.particleMesh.updateBoidBuffer();
    }

    // this.particleMesh.updateBuffers();
    // this.particleMesh.updateBoidBuffer();

    this.computePass.run(commandEncoder, context);
    this.particleRenderPass.run(commandEncoder, context);
  }

  getParticles() {
    return this.particleMesh;
  }
}
