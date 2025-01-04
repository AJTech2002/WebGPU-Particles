import { ArrayUniform } from "@engine/renderer/uniforms";
import { boidComputeShader, BoidData, BoidObjectData } from "./boid_component";
import { makeShaderDataDefinitions, TypeDefinition } from "webgpu-utils";
import { mat4, vec3, vec4 } from "gl-matrix";
import { assert } from "console";

export class BoidDataBuffer extends ArrayUniform<BoidData> {
    constructor(maxInstanceCount: number) {
      super("boidData", []);
  
      this.usage = GPUBufferUsage.STORAGE |
      GPUBufferUsage.COPY_DST |
      GPUBufferUsage.COPY_SRC ;

      const defs = makeShaderDataDefinitions(boidComputeShader);
      const boidDataStorageDescriptor = defs.storages.boids;
      const boidDataElementType: TypeDefinition = (
        boidDataStorageDescriptor.typeDefinition as any
      ).elementType;
  
      this.elementSize = boidDataElementType.size;
      this.byteSize = maxInstanceCount * boidDataElementType.size;
  
      this._value = [];
  
      this.f32Array = this.toFloat32Array(this._value);
    }
  
    protected override setArrayData(index: number, data: BoidData) {
  
      if (!this.f32Array) {
        console.warn("Boid data not initialized");
        return;
      }
  
      const packedSize = this.packedElementSize;
  
      this.f32Array[index * packedSize] = data.target[0];
      this.f32Array[index * packedSize + 1] = data.target[1];
      this.f32Array[index * packedSize + 2] = data.target[2];
      this.f32Array[index * packedSize + 3] = data.target[3];
  
      this.f32Array[index * packedSize + 4] = data.avoidance[0];
      this.f32Array[index * packedSize + 5] = data.avoidance[1];
      this.f32Array[index * packedSize + 6] = data.avoidance[2];
      this.f32Array[index * packedSize + 7] = data.avoidance[3];
  
      this.f32Array[index * packedSize + 8] = data.hasTarget ? 1 : 0;
      this.f32Array[index * packedSize + 9] = data.speed;
    }
  
    public getArrayData(index: number, f32Array: Float32Array): BoidData | null {
      if (!this.f32Array) {
        console.error("Boid data not initialized");
        return null;
      }


      const packedSize = this.packedElementSize;
  
      const target = vec4.fromValues(
        f32Array[index * packedSize],
        f32Array[index * packedSize + 1],
        f32Array[index * packedSize + 2],
        f32Array[index * packedSize + 3]
      );
  
      const avoidance = vec4.fromValues(
        f32Array[index * packedSize + 4],
        f32Array[index * packedSize + 5],
        f32Array[index * packedSize + 6],
        f32Array[index * packedSize + 7]
      );
  
      const hasTarget = this.f32Array[index * packedSize + 8] === 1;
      const speed = this.f32Array[index * packedSize + 9];
  
      return {
        target,
        avoidance,
        hasTarget,
        speed,
      };
    }
  }
  
  export class ObjectDataBuffer extends ArrayUniform<BoidObjectData> {
    constructor(maxInstanceCount: number) {
      super("boidData", []);
  
      this.usage = GPUBufferUsage.STORAGE |
      GPUBufferUsage.COPY_DST |
      GPUBufferUsage.COPY_SRC ;
  
      const defs = makeShaderDataDefinitions(boidComputeShader);
      const objectDataStorageDescriptor = defs.storages.objects;
      const elementType: TypeDefinition = (
        objectDataStorageDescriptor.typeDefinition as any
      ).elementType;
  
      this.elementSize = elementType.size;
      this.byteSize = maxInstanceCount * elementType.size;
      this._value = [];
      this.f32Array = this.toFloat32Array(this._value);
    }
  
    protected setArrayData(index: number, data: BoidObjectData): void {
      if (!this.f32Array) {
        console.warn("Boid data not initialized");
        return;
      }
    
      const packedSize = this.packedElementSize;
      const offset = packedSize * index;
    
      // Set model matrix (16 floats)
      for (let j = 0; j < 16; j++) {
        this.f32Array[offset + j] = data.model[j];
      }
    
      // Set position (3 floats, aligned after the matrix)
      const positionOffset = offset + 16;
      this.f32Array[positionOffset] = data.position[0];
      this.f32Array[positionOffset + 1] = data.position[1];
      this.f32Array[positionOffset + 2] = data.position[2];
    }
  
    protected getArrayData(index: number, f32Array: Float32Array): BoidObjectData | null {
      if (!this.f32Array) {
        console.error("Boid data not initialized");
        return null;
      }

      const offset = index * this.packedElementSize;

      const model = mat4.create();
      model[0] = f32Array[offset];
      model[1] = f32Array[offset + 1];
      model[2] = f32Array[offset + 2];
      model[3] = f32Array[offset + 3];
  
      model[4] = f32Array[offset + 4];
      model[5] = f32Array[offset + 5];
      model[6] = f32Array[offset + 6];
      model[7] = f32Array[offset + 7];
  
      model[8] = f32Array[offset + 8];
      model[9] = f32Array[offset + 9];
      model[10] =f32Array[offset + 10];
      model[11] =f32Array[offset + 11];
  
      model[12] =f32Array[offset + 12];
      model[13] =f32Array[offset + 13];
      model[14] =f32Array[offset + 14];
      model[15] =f32Array[offset + 15];

      const position = vec3.fromValues(
        f32Array[offset + 16],
        f32Array[offset + 17],
        f32Array[offset + 18]
      );

  
      return {
        model,
        position,
      };
    }
  }
  
