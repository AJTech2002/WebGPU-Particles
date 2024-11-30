import shader from "./shaders/shaders.wgsl";
import computeShaderCode from "./shaders/compute.wgsl";
import matrixShader from "./shaders/matrix.wgsl";
import { TriangleMesh } from "./triangle_mesh";
import { mat4 } from "gl-matrix";

export class Renderer {

    canvas: HTMLCanvasElement;

    adapter!: GPUAdapter;
    device!: GPUDevice;
    context!: GPUCanvasContext;
    format!: GPUTextureFormat;

    uniformBuffer!: GPUBuffer;
    bindGroup!: GPUBindGroup;
    pipeline!: GPURenderPipeline;

    triangleMesh!: TriangleMesh;
    objectBuffer!: GPUBuffer;

    //a little dodgy but let's do this for not
    t: number = 0.0;


    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.t = 0.0;
    }

    async Initialize() {

        await this.setupDevice();

        this.createAssets();

        await this.makePipeline();

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

        this.device.addEventListener('uncapturedƒerror', event => console.error(event));


    }

    async makePipeline() {

        this.uniformBuffer = this.device.createBuffer({
            size: 64 * 2,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        });

        const bindGroupLayout = this.device.createBindGroupLayout({
            entries: [
                {
                    binding: 0,
                    visibility: GPUShaderStage.VERTEX,
                    buffer: {}
                },
                {
                    binding: 1,
                    visibility: GPUShaderStage.VERTEX,
                    buffer: {
                        type: "read-only-storage",
                        hasDynamicOffset: false
                    }
                }
            ]

        });

        this.bindGroup = this.device.createBindGroup({
            layout: bindGroupLayout,
            entries: [
                {
                    binding: 0,
                    resource: {
                        buffer: this.uniformBuffer
                    }
                },
                {
                    binding: 1,
                    resource: {
                        buffer: this.objectBuffer
                    }
                }
            ]
        });

        const pipelineLayout = this.device.createPipelineLayout({
            bindGroupLayouts: [bindGroupLayout]
        });

        this.pipeline = this.device.createRenderPipeline({
            vertex: {
                module: this.device.createShaderModule({
                    code: shader
                }),
                entryPoint: "vs_main",
                buffers: [this.triangleMesh.bufferLayout,]
            },

            fragment: {
                module: this.device.createShaderModule({
                    code: shader
                }),
                entryPoint: "fs_main",
                targets: [{
                    format: this.format
                }]
            },

            primitive: {
                topology: "triangle-list"
                // topology: "point-list"
                // topology: "line-strip"
            },

            layout: pipelineLayout
        });

        const computeLayoutGroup = this.device.createBindGroupLayout({
            entries: [{
                binding: 0,
                visibility: GPUShaderStage.COMPUTE,
                buffer: { type: 'storage' },
            }],
        });
        
        this.computeBindGroup = this.device.createBindGroup({
            layout: computeLayoutGroup,
            entries: [{
                binding: 0,
                resource: { buffer: this.objectBuffer },
            }],
        });
        
        this.computePipeline = this.device.createComputePipeline({
            layout: this.device.createPipelineLayout({ bindGroupLayouts: [computeLayoutGroup] }),
            compute: {
                module: this.device.createShaderModule({ code: matrixShader + " \n " + computeShaderCode }),
                entryPoint: 'computeMain',
            },
        });

    }

    private computeBindGroup : GPUBindGroup | undefined;
    private computePipeline : GPUComputePipeline | undefined;

    createAssets() {
        this.triangleMesh = new TriangleMesh(this.device);

        const modelBufferDescriptor: GPUBufferDescriptor = {
            size: 64 * 10024,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST        | GPUBufferUsage.COPY_SRC,
        };

        this.objectBuffer = this.device.createBuffer(modelBufferDescriptor);
        this.device.queue.writeBuffer(this.objectBuffer, 0, this.triangleMesh.object_data, 0, this.triangleMesh.object_data.length)

    }

    render = () => {

        this.t += 0.01;
        if (this.t > 2.0 * Math.PI) {
            this.t -= 2.0 * Math.PI;
        }

        //make transforms
        const projection = mat4.create();
        // load perspective projection into the projection matrix,
        // Field of view = 45 degrees (pi/4)
        // Aspect ratio = 800/600
        // near = 0.1, far = 10 
        // mat4.perspective(projection, Math.PI / 4, 800 / 600, 0.1, 100);

        mat4.ortho(projection, -8, 8, -6, 6, 0, 20);

        const view = mat4.create();
        mat4.lookAt(view, [0, 0, 5], [0, 0, 0], [0, 1, 0]);

        const model = mat4.create();

        this.device.queue.writeBuffer(this.uniformBuffer, 0, <ArrayBuffer>view);
        this.device.queue.writeBuffer(this.uniformBuffer, 64, <ArrayBuffer>projection);

        //command encoder: records draw commands for submission
        const commandEncoder: GPUCommandEncoder = this.device.createCommandEncoder();

        if (this.computePipeline === undefined || this.computeBindGroup === undefined) {
            return;
        }

        const computePass = commandEncoder.beginComputePass();
        computePass.setPipeline(this.computePipeline);
        computePass.setBindGroup(0, this.computeBindGroup);
        computePass.dispatchWorkgroups(Math.ceil(this.triangleMesh.triangleCount / 64));
        computePass.end();

        //texture view: image view to the color buffer in this case
        const textureView: GPUTextureView = this.context.getCurrentTexture().createView();
        //renderpass: holds draw commands, allocated from command encoder
        const renderpass: GPURenderPassEncoder = commandEncoder.beginRenderPass({
            colorAttachments: [{
                view: textureView,
                clearValue: { r: 0.0, g: 0.0, b: 0.0, a: 1.0 },
                loadOp: "clear",
                storeOp: "store"
            }]
        });


        this.device.queue.writeBuffer(this.triangleMesh.buffer, 0, this.triangleMesh.vertices.buffer, 0, this.triangleMesh.vertexCount * 6 * 4);

        renderpass.setPipeline(this.pipeline);
        
        renderpass.setVertexBuffer(0, this.triangleMesh.buffer);
        renderpass.setBindGroup(0, this.bindGroup);
        renderpass.draw(this.triangleMesh.vertexCount, this.triangleMesh.triangleCount, 0, 0);
        renderpass.end();

        this.device.queue.submit([commandEncoder.finish()]);

        requestAnimationFrame(this.render);
    }

}