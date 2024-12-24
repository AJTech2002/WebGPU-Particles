import { mat4 } from "gl-matrix";
import Material from "./material";
import { device, renderTargetFormat } from "@engine/engine";
import { makeBindGroupLayoutDescriptors, makeShaderDataDefinitions } from "webgpu-utils";

import LayoutShader from "./shaders/layout_generator.wgsl";

export class Renderer {

    private canvas: HTMLCanvasElement;
    private context!: GPUCanvasContext;
    private _format!: GPUTextureFormat;
    private _device: GPUDevice = device;

    // This buffer will store all engine-wide uniforms
    private globalUniformBuffer!: GPUBuffer;
    private globalUniformBindGroup!: GPUBindGroup;
    private globalUniformBindGroupLayout!: GPUBindGroupLayout;

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
        this.canvas.height = window.innerHeight + 20;

        window.addEventListener("resize", () => {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        });
    }

    start() {

        this._device = device;
        this._format = renderTargetFormat;

        this.setupDevice();
    }

    setupDevice() {
        //context: similar to vulkan instance (or OpenGL context)
        this.context = this.canvas.getContext("webgpu") as any;
        
       
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

        const pipelineDesc = {
            vertex: {
              module,
              entryPoint: "vs_main",
              buffers: [], // This is passed in because it depends on how the mesh is structured
            },
            fragment: {
              module,
              entryPoint: "fs_main",
              targets: [{ format: renderTargetFormat }],
            },
          };
      
        
        const defs = makeShaderDataDefinitions(LayoutShader);
        const descriptors = makeBindGroupLayoutDescriptors(defs, pipelineDesc);
        this.globalUniformBindGroupLayout = device.createBindGroupLayout(descriptors[0]);
        this.globalUniformBindGroup = device.createBindGroup({
            layout: this.globalUniformBindGroupLayout,
            entries: [
                {
                    binding: 0,
                    resource: {
                        buffer: this.globalUniformBuffer,
                    }
                }
            ]
        });
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

        renderpass.setBindGroup(0, this.globalUniformBindGroup); // Global Uniforms

        for (let i = 0; i < materials.length; i++) {
            const mat = materials[i];
            if (mat.bindGroup !== undefined && mat.meshes.length > 0) {
                renderpass.setPipeline(mat.pipeline);
                renderpass.setBindGroup(1, mat.bindGroup); // Material Level Uniforms
                for (let mesh of mat.meshes) {
                    if (mesh.bindGroup !== undefined) {
                        renderpass.setBindGroup(2, mesh.bindGroup); // Mesh Level Uniforms
                        renderpass.setVertexBuffer(0, mesh.getVertexBuffer()); // Mesh
                        renderpass.draw(mesh.getVertexCount(), mat.instanceCount, 0, 0); 
                    }
                }
            }
        }
        

        renderpass.end();
        this._device.queue.submit([commandEncoder.finish()]);

    }

}