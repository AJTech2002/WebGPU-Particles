import { mat4 } from "gl-matrix";
import Material from "./material";
export declare class Renderer {
    private canvas;
    private context;
    private _format;
    private _device;
    private globalUniformBuffer;
    private globalUniformBindGroup;
    private globalUniformBindGroupLayout;
    private depthDepthTextureState;
    private depthTextureBuffer;
    private depthTextureView;
    private depthStencilAttachment;
    get device(): GPUDevice;
    get format(): GPUTextureFormat;
    get uniforms(): GPUBuffer;
    constructor(canvas: HTMLCanvasElement);
    start(): Promise<void>;
    dispose(): void;
    private setupDevice;
    private makeDepthBuffer;
    private initCameraBuffer;
    getDepthStencilState(): GPUDepthStencilState;
    updateGlobalUniforms(view: mat4, projection: mat4, time: number): void;
    render: (deltaTime: number, materials: Material[]) => void;
}
