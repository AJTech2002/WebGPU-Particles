export default class Texture {
    texture: GPUTexture;
    view: GPUTextureView;
    sampler: GPUSampler;
    constructor();
    loadTexture(url: string): Promise<void>;
    private loadImageBitmap;
}
