import { ShaderDataType, ShaderTypes } from "./datatypes";
import { mat4, vec3, vec4 } from "gl-matrix";

export function getPrimitiveByteSize (type: ShaderDataType) : number {
  switch (type.type) {
    case ShaderTypes.mat4x4: return 64;
    case ShaderTypes.vec4: return 16;
    case ShaderTypes.vec3: return 12;
    case ShaderTypes.bool: return 4;
    default: return 4;
  }
}

export function getPrimitiveAlignment (type: ShaderDataType) : number {
  switch (type.type) {
    case ShaderTypes.mat4x4: return 16;
    case ShaderTypes.vec4: return 16;
    case ShaderTypes.vec3: return 16;
    case ShaderTypes.bool: return 4;
    default: return 4;
  }
}

export function parseFromPrimitives(data: Float32Array, type: ShaderDataType): unknown {
  switch (type.type) {
    case ShaderTypes.mat4x4: {
      if (data.length !== 16) {
        throw new Error(`Invalid data length for mat4. Expected 16, got ${data.length}`);
      }
      const mat4: mat4 = Array.from(data) as mat4;
      return mat4;
    }
    case ShaderTypes.vec4: {
      if (data.length !== 4) {
        throw new Error(`Invalid data length for vec4. Expected 4, got ${data.length}`);
      }
      const vec4: vec4 = Array.from(data) as vec4;
      return vec4;
    }
    case ShaderTypes.vec3: {
      if (data.length !== 3) {
        throw new Error(`Invalid data length for vec3. Expected 3, got ${data.length}`);
      }
      const vec3: vec3 = Array.from(data) as vec3;
      return vec3;
    }
    case ShaderTypes.bool: {
      if (data.length !== 1) {
        throw new Error(`Invalid data length for bool. Expected 1, got ${data.length}`);
      }
      
      const u32Array = new Uint32Array(data.buffer);
      return u32Array[0] === 1;
    }
    case ShaderTypes.u32: {
      if (data.length !== 1) {
        throw new Error(`Invalid data length for u32. Expected 1, got ${data.length}`);
      }
      const u32Array = new Uint32Array(data.buffer);
      return u32Array[0];
    }
    case ShaderTypes.i32: {
      if (data.length !== 1) {
        throw new Error(`Invalid data length for i32. Expected 1, got ${data.length}`);
      }
      const i32Array = new Int32Array(data.buffer);
      return i32Array[0];
    }
    default: {
      if (data.length !== 1) {
        throw new Error(`Invalid data length for scalar. Expected 1, got ${data.length}`);
      }
      return data[0]; // Return scalar directly
    }
  }
}

export function parsePrimitives (data: unknown, type: ShaderDataType) : Float32Array | Uint32Array {
  switch (type.type) {
    case ShaderTypes.mat4x4: {
      const mat4 = data as mat4;
      const mat4_f32 = new Float32Array(16);

      for (let i = 0; i < 16; i++) {
        mat4_f32[i] = mat4[i];
      }

      return mat4_f32;
    }
    case ShaderTypes.vec4: {
      const vec4 = data as vec4;
      return new Float32Array(vec4);
    }
    case ShaderTypes.vec3: {
      const vec3 = data as vec3;
      return new Float32Array(vec3);
    }
    case ShaderTypes.bool: {
      const u32 = (data as boolean) ? 1 : 0;
      const u32Array = new Uint32Array(1);
      const f32Array = new Float32Array(u32Array.buffer);
      u32Array[0] = u32;
      return f32Array;
    }
    case ShaderTypes.u32:
    {
      const u32 = data as number;
      const u32Array = new Uint32Array(1);
      const f32Array = new Float32Array(u32Array.buffer);
      u32Array[0] = u32;
      return f32Array;
    }
    case ShaderTypes.i32:
    {
      const i32 = data as number;
      const i32Array = new Int32Array(1);
      const f32Array = new Float32Array(i32Array.buffer);
      i32Array[0] = i32;
      return f32Array;
    }
    default:
    {
      const f32 = data as number;
      return new Float32Array([f32]);
    }
      
  }
}


