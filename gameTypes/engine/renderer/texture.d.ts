export default class Texture {
    texture: GPUTexture;
    view: GPUTextureView;
    sampler: GPUSampler;
    constructor(isMultiTexture?: boolean);
    loadMultipleTextures(urls: string[]): Promise<void>;
    downloadImage(url: string): Promise<ImageBitmap>;
    loadTexture(url: string): Promise<void>;
    private setupView;
    private setupTexture;
    private loadImageBitmap;
}
