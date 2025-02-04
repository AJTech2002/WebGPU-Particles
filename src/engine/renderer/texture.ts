import { device } from "@engine/engine";

export default class Texture {

  texture: GPUTexture;
  view: GPUTextureView;
  sampler: GPUSampler;


  constructor(isMultiTexture: boolean = false) {
    
    // create dummy texture in the meantime
    this.texture = device.createTexture({
      size: {
        width: 1,
        height: 1,
        depthOrArrayLayers: isMultiTexture ? 2 : 1
      },
      format: "rgba8unorm",
      usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT,
      mipLevelCount: 1,
      sampleCount: 1
    });

    
    this.view = this.texture.createView({
      dimension: isMultiTexture ? "2d-array" : "2d",
      arrayLayerCount: isMultiTexture ? 2 : 1,
    });

    this.sampler = device.createSampler({
      addressModeU: "repeat",
      addressModeV: "repeat",
      magFilter: "linear",
      minFilter: "nearest",
      mipmapFilter: "nearest",
      maxAnisotropy: 1,
    });



  } 

  async loadMultipleTextures (urls: string[]) {
    const images = await Promise.all(urls.map(url => this.downloadImage(url)));
    const depth = images.length;

    const width = images[0].width;
    const height = images[0].height;

    this.setupTexture(width, height, depth);

    for (let i = 0; i < images.length; i++) {
      await this.loadImageBitmap(device, images[i], i, depth);
    }

    this.setupView(depth);

  }

  async downloadImage (url: string) {
    const response: Response = await fetch(url);
    const blob: Blob = await response.blob();
    const imageData: ImageBitmap = await createImageBitmap(blob);
    return imageData;
  }

  async loadTexture (url: string) {
    
    const imageData = await this.downloadImage(url);

    this.setupTexture(imageData.width, imageData.height, 1);
    await this.loadImageBitmap(device, imageData);

    this.setupView();
    
  }

  private setupView (
    layers: number = 1,
  ) {
    const viewDescriptor : GPUTextureViewDescriptor = {
      format: "rgba8unorm",
      dimension: layers === 1 ? "2d" : "2d-array",
      aspect: "all",
      baseArrayLayer: 0,
      arrayLayerCount: layers,
      mipLevelCount: 1,

    }

    this.view = this.texture.createView(viewDescriptor)!;

    const samplerDescriptor: GPUSamplerDescriptor = {
      addressModeU: "repeat",
      addressModeV: "repeat",
      magFilter: "linear",
      minFilter: "nearest",
      mipmapFilter: "nearest",
      maxAnisotropy: 1,
    }

    this.sampler = device.createSampler(samplerDescriptor);
  }

  private setupTexture(
    width: number,
    height: number,
    depth: number,
  ) {
    const textureDescriptor : GPUTextureDescriptor = {
      size: {
        width: width,
        height: height,
        depthOrArrayLayers: depth
      },
      format: "rgba8unorm",
      usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT,
    }

    this.texture = device.createTexture(textureDescriptor);
  }

  private async loadImageBitmap (device: GPUDevice, imageData: ImageBitmap, depth: number = 0, totalDepth: number = 1) {
    const extent = {
      width: imageData.width,
      height: imageData.height,
      depthOrArrayLayers: 1
    }
    // Command
    device.queue.copyExternalImageToTexture(
      {source: imageData},
      {texture: this.texture, origin: {x: 0, y: 0, z: depth}},
      extent
    )
  }
  

}
