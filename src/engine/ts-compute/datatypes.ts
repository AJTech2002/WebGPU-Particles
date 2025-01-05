import "reflect-metadata";

export enum ShaderTypes {
  f32 = "f32",
  vec4 = "vec4",
  vec3 = "vec3",
  u32 = "u32",
  mat4x4 = "mat4x4",
  i32 = "i32",
  bool = "bool",
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
    default:
      console.error("Unknown shader type, using f32 as default");
      return "f32";
  }
}

// key of shader type as string

export function createStruct (type: (new() => T)) : string {

    const constructorName = type.name;
    const instance = new type();

    const props = Object.getOwnPropertyNames(instance);

    const bufferLayout : ShaderDataType[] = [];

    for (const prop of props) {
      const type = Reflect.getMetadata("type", instance, prop);
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


