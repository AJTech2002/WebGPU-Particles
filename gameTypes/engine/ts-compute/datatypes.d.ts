import "reflect-metadata";
import { BufferSchemaDescriptor } from "./compute";
export declare enum ShaderTypes {
    f32 = "f32",
    vec4 = "vec4",
    vec3 = "vec3",
    u32 = "u32",
    mat4x4 = "mat4x4",
    i32 = "i32",
    bool = "bool",
    atomicI32 = "atomicI32",
    atomicU32 = "atomicU32"
}
export declare function getShaderCode(type: keyof typeof ShaderTypes): string;
export declare function createBinding(index: number, group: number, bufferSchema: BufferSchemaDescriptor<any>): string;
export declare function createStruct<T extends Object>(type: (new () => T)): string;
export declare function createStructs<T extends Object>(types: (new () => any)[]): string;
export interface ShaderDataType {
    /**
     * The key of the property, if null then it is a simple primitive
     */
    key?: string;
    type: keyof typeof ShaderTypes;
    array?: ShaderArrayProperty;
}
export interface ShaderArrayProperty {
    maxInstanceCount: number;
}
export declare function shaderProperty(shaderType: keyof typeof ShaderTypes): PropertyDecorator;
export declare function shaderStruct(structName: string): ClassDecorator;
export declare enum StorageMode {
    uniform = "uniform",
    read = "read",
    write = "write",
    read_write = "read_write"
}
export declare function shaderBuffer<T>(type: (new () => T) | keyof typeof ShaderTypes, storageMode: StorageMode | undefined, defaultValue: T | T[], maxInstanceCount?: number): PropertyDecorator;
