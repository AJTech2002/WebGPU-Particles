export class Euler {
    constructor(x?: number, y?: number, z?: number, order?: string);
    isEuler: boolean;
    _x: number;
    _y: number;
    _z: number;
    _order: string;
    set x(value: number);
    get x(): number;
    set y(value: number);
    get y(): number;
    set z(value: number);
    get z(): number;
    set order(value: string);
    get order(): string;
    set(x: any, y: any, z: any, order?: string): this;
    clone(): any;
    copy(euler: any): this;
    setFromRotationMatrix(m: any, order?: string, update?: boolean): this;
    setFromQuaternion(q: any, order: any, update: any): this;
    setFromVector3(v: any, order?: string): this;
    reorder(newOrder: any): this;
    equals(euler: any): boolean;
    fromArray(array: any): this;
    toArray(array?: any[], offset?: number): any[];
    _onChange(callback: any): this;
    _onChangeCallback(): void;
    toVector3(): void;
    [Symbol.iterator](): Generator<string | number, void, unknown>;
}
export namespace Euler {
    let DefaultOrder: string;
    let RotationOrders: string[];
}
