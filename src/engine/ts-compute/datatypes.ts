import "reflect-metadata";
import { BufferSchema, BufferSchemaDescriptor } from "./compute";
import { isArray } from "util";

export enum ShaderTypes {
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

export function getShaderCode (type: keyof typeof ShaderTypes): string {
  switch (type) {
    case ShaderTypes.f32:
      return "f32";
    case ShaderTypes.vec4:
      return "vec4<f32>";
    case ShaderTypes.vec3:
      return "vec3<f32>";
    case ShaderTypes.u32:
      return "u32";
    case ShaderTypes.mat4x4:
      return "mat4x4<f32>";
    case ShaderTypes.i32:
      return "i32";
    case ShaderTypes.bool:
      return "u32";
    case ShaderTypes.atomicU32:
      return "atomic<u32>";
    case ShaderTypes.atomicI32:
      return "atomic<i32>";
    default:
      console.error("Unknown shader type, using f32 as default");
      return "f32";
  }
}


export function createBinding (index: number, group: number, bufferSchema: BufferSchemaDescriptor<any>) : string {
 let binding  = `@binding(${index}) @group(${group}) var<`;
 if (bufferSchema.storageMode === StorageMode.uniform) {
   binding += "uniform";
 }
 else if (bufferSchema.storageMode === StorageMode.read) {
   binding += "storage, read";
 }
 else if (bufferSchema.storageMode === StorageMode.write) {
   binding += "storage, read_write";
 }
 else if (bufferSchema.storageMode === StorageMode.read_write) {
   binding += "storage, read_write";
 }
 else {
   console.error("Unknown storage mode, using uniform as default");
   binding += "uniform";
 }

  binding += `> ${bufferSchema.name}: `;

  let bindingTypeName = "";
  if (typeof bufferSchema.type === "string") {
    bindingTypeName = getShaderCode(bufferSchema.type as keyof typeof ShaderTypes);
  }
  else {
    bindingTypeName = Reflect.getMetadata("structName", bufferSchema.type); 
  }



  if (bufferSchema.isArray) {
    binding += `array<${bindingTypeName}>`;
  }
  else {
    binding += bindingTypeName;
  }

  binding += ";\n";

  return binding;

}

// key of shader type as string

export function createStruct<T extends Object> (type: (new() => T)) : string {

    const constructorName = Reflect.getMetadata("structName", type);
    const instance = new type();

    const props = Object.getOwnPropertyNames(instance);

    const bufferLayout : ShaderDataType[] = [];

    for (const prop of props) {
      const type = Reflect.getMetadata("type", instance as Object, prop);
      if (type) {
        bufferLayout.push(type);
      }
    }

    let struct = `struct ${constructorName} {\n`;

    for (let i = 0; i < bufferLayout.length; i++) {
      const type = bufferLayout[i];
      if (type.key) {
        struct += ` ${type.key}: ${getShaderCode(type.type)},\n`;
      }
    }

    struct += "};\n";

    return struct;
}

export function createStructs<T extends Object> (types: (new() => any)[]) : string {
  let struct = "";
  for (let i = 0; i < types.length; i++) {
    struct += createStruct(types[i]);
  }
  return struct;
}

export interface ShaderDataType {
  /**
   * The key of the property, if null then it is a simple primitive
   */
  key?: string; 
  type: keyof typeof ShaderTypes;
}

export function shaderProperty (shaderType: keyof typeof ShaderTypes): PropertyDecorator {
  return (target: Object, propertyKey: string | symbol) => {
    const type : ShaderDataType = {
      key: propertyKey.toString(),
      type: shaderType,
    }

    Reflect.defineMetadata("type", type, target, propertyKey);
  };
}


export function shaderStruct (structName: string): ClassDecorator {
  return (target: Function) => {
    Reflect.defineMetadata("structName", structName, target);
  };
}

export enum StorageMode {
  uniform = "uniform",
  read = "read",
  write = "write",
  read_write = "read_write",
}



export function shaderBuffer<T>(
  type : (new() => T) | keyof typeof ShaderTypes,
  storageMode = StorageMode.uniform,
  defaultValue: T | T[],
  maxInstanceCount = -1,
): PropertyDecorator {
  return (target: Object, propertyKey: string | symbol) => {
    // Retrieve the design type of the property
    const propertyType = type;
    // Define the buffer descriptor with the retrieved type
    const bufferDescriptor: BufferSchemaDescriptor<T> = {
      name: propertyKey.toString(),
      isArray: Array.isArray(defaultValue), 
      type: propertyType,
      defaultValue: defaultValue, 
      maxInstanceCount: maxInstanceCount,
      storageMode: storageMode,
    };

    // Define the metadata for the property
    Reflect.defineMetadata('buffer', bufferDescriptor, target, propertyKey);
  };
}
 

