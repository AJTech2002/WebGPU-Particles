import { ShaderDataType } from "./datatypes";
export declare function getPrimitiveByteSize(type: ShaderDataType): number;
export declare function getPrimitiveAlignment(type: ShaderDataType): number;
export declare function parseFromPrimitives(data: Float32Array, type: ShaderDataType): unknown;
export declare function parsePrimitives(data: unknown, type: ShaderDataType): Float32Array | Uint32Array;
