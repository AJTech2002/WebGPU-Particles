import InstancedMesh from "./core/engine/mesh/instanced_mesh";

export class QuadMesh extends InstancedMesh {



  constructor(device: GPUDevice, renderPass: any, scene: any) { 

    super(device, renderPass, scene);

    this.vertices = new Float32Array([
      -0.5, -0.5, 0.0, 1.0, 0.0, 0.0, 
      0.5, -0.5, 0.0, 0.0, 1.0, 0.0, 
      -0.5, 0.5, 0.0, 0.0, 0.0, 1.0, 
      0.5, -0.5, 0.0, 0.0, 1.0, 0.0, 
      0.5, 0.5, 0.0, 0.0, 0.0, 1.0, 
      -0.5, 0.5, 0.0, 1.0, 0.0, 0.0,
    ]);

    

    this.vertexCount = this.vertices.length / 6;


    super(device, renderPass, scene);
  }  

}