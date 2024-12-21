import { mat4 } from "gl-matrix";
import Material from "./material";

export class Renderer {

    private canvas: HTMLCanvasElement;
    private adapter!: GPUAdapter;
    private _device!: GPUDevice;
    private context!: GPUCanvasContext;
    private _format!: GPUTextureFormat;

    // This buffer will store all engine-wide uniforms
    private globalUniformBuffer!: GPUBuffer;

    public get device() {
        return this._device;
    }

    public get format() {
        return this._format;
    }

    public get uniforms() {
        return this.globalUniformBuffer;
    }
    

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;

        window.addEventListener("resize", () => {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        });
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
        this._device = <GPUDevice>await this.adapter?.requestDevice();
        
        //context: similar to vulkan instance (or OpenGL context)
        this.context = this.canvas.getContext("webgpu") as any;
        
        this._format = "bgra8unorm";
        this.context.configure({
            device: this._device,
            format: this._format,
            alphaMode: "opaque"
        });

        this._device.addEventListener('uncapturederror', event => console.error(event));

        // Setup camera buffer
        this.initCameraBuffer();
    }

    private initCameraBuffer() {
        this.globalUniformBuffer = this.device.createBuffer({
            size: 64  + 64 + 16, // 16 for alignment with mat4x4 (which is vec4x4)
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        })
    }

    public updateGlobalUniforms(view: mat4, projection: mat4, time: number) {
        this.device.queue.writeBuffer(this.globalUniformBuffer, 0, <ArrayBuffer>view);
        this.device.queue.writeBuffer(this.globalUniformBuffer, 64, <ArrayBuffer>projection);
        this.device.queue.writeBuffer(this.globalUniformBuffer, 128, new Float32Array([time])); // time 
    }

    render = (deltaTime: number, materials: Material[]) => {
        const commandEncoder: GPUCommandEncoder = this._device.createCommandEncoder();

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
            const mat = materials[i];
            if (mat.bindGroup !== undefined) {
                renderpass.setPipeline(mat.pipeline);
                
                for (let mesh of mat.meshes) {
                    renderpass.setVertexBuffer(0, mesh.getVertexBuffer()); // Mesh
                    renderpass.setBindGroup(0, mat.bindGroup); // Material

                    // Explanation : 
                    // Amount of times to call the vertex shader, passing an instance ID
                    renderpass.draw(mesh.getVertexCount(), mat.instanceCount, 0, 0); 
                }
            }
        }
        

        renderpass.end();
        this._device.queue.submit([commandEncoder.finish()]);

    }

}