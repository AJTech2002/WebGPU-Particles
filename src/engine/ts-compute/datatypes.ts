import "reflect-metadata";

export enum ShaderTypes {
  f32 = "f32",
  vec4 = "vec4",
  vec3 = "vec3",
  bool = "bool",
  u32 = "u32",
  mat4 = "mat4",
  i32 = "i32",
}

export interface ShaderDataType {
  /**
   * The key of the property, if null then it is a simple primitive
   */
  key?: string; 
  type: keyof typeof ShaderTypes;
}

function f32 (): PropertyDecorator {
  return (target: Object, propertyKey: string | symbol) => {
    const type : ShaderDataType = {
      key: propertyKey.toString(),
      type: "f32",
    }

    Reflect.defineMetadata("type", type, target, propertyKey);
  };
}

function m4(): PropertyDecorator {
  return (target: Object, propertyKey: string | symbol) => {
    const type : ShaderDataType = {
      key: propertyKey.toString(),
      type: "mat4",
    }

    Reflect.defineMetadata("type", type, target, propertyKey);
  };
}

function v4 (): PropertyDecorator {
  return (target: Object, propertyKey: string | symbol) => {
    const type : ShaderDataType = {
      key: propertyKey.toString(),
      type: "vec4",
    }

    Reflect.defineMetadata("type", type, target, propertyKey);
  };
}

function v3 (): PropertyDecorator {
  return (target: Object, propertyKey: string | symbol) => {
    const type : ShaderDataType = {
      key: propertyKey.toString(),
      type: "vec3",
    }

    Reflect.defineMetadata("type", type, target, propertyKey);
  };
}

function b (): PropertyDecorator {
  return (target: Object, propertyKey: string | symbol) => {
    const type : ShaderDataType = {
      key: propertyKey.toString(),
      type: "bool",
    }

    Reflect.defineMetadata("type", type, target, propertyKey);
  };
}

function u32 (): PropertyDecorator {
  return (target: Object, propertyKey: string | symbol) => {
    const type : ShaderDataType = {
      key: propertyKey.toString(),
      type: "u32",
    }

    Reflect.defineMetadata("type", type, target, propertyKey);
  };
}

export { f32, v4, b, u32, m4, v3 };
