import tgpu from "typegpu";
import Material from "../material";

export class Renderer {

    private canvas: HTMLCanvasElement;
    private adapter!: GPUAdapter;
    private device!: GPUDevice;
    private context!: GPUCanvasContext;
    private format!: GPUTextureFormat;
    
    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
    }

    async init() {
        await this.setupDevice();
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

    render = (deltaTime: number, materials: Material[]) => {
        const commandEncoder: GPUCommandEncoder = this.device.createCommandEncoder();
        this.device.queue.submit([commandEncoder.finish()]);

        // Actual rendering logic should be done here
        const context: GPUCanvasContext = this.context;
        const textureView: GPUTextureView = context.getCurrentTexture().createView();

        const renderpass: GPURenderPassEncoder = commandEncoder.beginRenderPass({
            colorAttachments: [{
                view: textureView,
                clearValue: { r:1.0, g: 1.0, b: 1.0, a: 1.0 },
                loadOp: "clear",
                storeOp: "store"
            }]
        });

        for (let i = 0; i < materials.length; i++) {
            renderpass.setPipeline(materials[i].pipeline);
            
            for (let mesh of materials[i].meshes) {
                renderpass.setVertexBuffer(0, mesh.getVertexBuffer()); // Mesh
                renderpass.setBindGroup(0, materials[i].bindGroup); // Material

                // Explanation : 
                // Amount of times to call the vertex shader, passing an instance ID
                renderpass.draw(mesh.getVertexCount(), materials[i].instanceCount, 0, 0); 
            }
        }
        

        renderpass.end();
    }

}