import InfinityTest from "../../infinity_test";
import ParticleScene from "../../test_scene";

export class Renderer {

    canvas: HTMLCanvasElement;
    adapter!: GPUAdapter;
    device!: GPUDevice;
    context!: GPUCanvasContext;
    format!: GPUTextureFormat;

    scene!: InfinityTest;

    //a little dodgy but let's do this for not
    t: number = 0.0;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.t = 0.0;
    }

    async Initialize() {
        await this.setupDevice();
        this.scene = new InfinityTest(this);
        this.render();
    }

    async setupDevice() {
        //adapter: wrapper around (physical) GPU.
        //Describes features and limits
        this.adapter = <GPUAdapter>await navigator.gpu?.requestAdapter();

        //device: wrapper around GPU functionality
        //Function calls are made through the device
        this.device = <GPUDevice>await this.adapter?.requestDevice();
        
        //context: similar to vulkan instance (or OpenGL context)
        this.context = this.canvas.getContext("webgpu") as any;
        
        this.format = "bgra8unorm";
        this.context.configure({
            device: this.device,
            format: this.format,
            alphaMode: "opaque"
        });

        this.device.addEventListener('uncapturederror', event => console.error(event));
    }

    render = () => {
        this.t += 0.01;

        const commandEncoder: GPUCommandEncoder = this.device.createCommandEncoder();

        this.scene.render(commandEncoder, this.context);
        this.device.queue.submit([commandEncoder.finish()]);
        requestAnimationFrame(this.render);
    }

}