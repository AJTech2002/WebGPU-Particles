export default class Texture {

  texture: GPUTexture | null = null;
  view: GPUTextureView | null = null;
  sampler: GPUSampler | null = null;

  async loadTexture(device: GPUDevice, url: string) {
    console.log("Loading texture");
    const response: Response = await fetch(url);
    console.log(response);
    const blob: Blob = await response.blob();
    console.log(blob);
    const imageData: ImageBitmap = await createImageBitmap(blob);
    console.log(imageData);
    await this.loadImageBitmap(device, imageData);

    const viewDescriptor : GPUTextureViewDescriptor = {
      format: "rgba8unorm",
      dimension: "2d",
      aspect: "all",
      baseArrayLayer: 0,
      arrayLayerCount: 1,
      mipLevelCount: 1,
    }

    this.view = this.texture?.createView(viewDescriptor)!;

    const samplerDescriptor: GPUSamplerDescriptor = {
      addressModeU: "repeat",
      addressModeV: "repeat",
      magFilter: "linear",
      minFilter: "nearest",
      mipmapFilter: "nearest",
      maxAnisotropy: 1
    }

    this.sampler = device.createSampler(samplerDescriptor);
  }

  private async loadImageBitmap (device: GPUDevice, imageData: ImageBitmap) {
    const textureDescriptor : GPUTextureDescriptor = {
      size: {
        width: imageData.width,
        height: imageData.height,
      },
      format: "rgba8unorm",
      usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT,
    }

    this.texture = device.createTexture(textureDescriptor);

    // Command
    device.queue.copyExternalImageToTexture(
      {source: imageData},
      {texture: this.texture},
      textureDescriptor.size
    )
    
  }
  

}