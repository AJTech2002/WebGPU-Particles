export class Quaternion {
    static slerpFlat(dst: any, dstOffset: any, src0: any, srcOffset0: any, src1: any, srcOffset1: any, t: any): void;
    static multiplyQuaternionsFlat(dst: any, dstOffset: any, src0: any, srcOffset0: any, src1: any, srcOffset1: any): any;
    constructor(x?: number, y?: number, z?: number, w?: number);
    isQuaternion: boolean;
    _x: number;
    _y: number;
    _z: number;
    _w: number;
    set x(value: number);
    get x(): number;
    set y(value: number);
    get y(): number;
    set z(value: number);
    get z(): number;
    set w(value: number);
    get w(): number;
    set(x: any, y: any, z: any, w: any): this;
    clone(): any;
    copy(quaternion: any): this;
    setFromEuler(euler: any, update: any): this;
    setFromAxisAngle(axis: any, angle: any): this;
    setFromRotationMatrix(m: any): this;
    setFromUnitVectors(vFrom: any, vTo: any): this;
    angleTo(q: any): number;
    rotateTowards(q: any, step: any): this;
    identity(): this;
    invert(): this;
    conjugate(): this;
    dot(v: any): number;
    lengthSq(): number;
    length(): number;
    normalize(): this;
    multiply(q: any): this;
    premultiply(q: any): this;
    multiplyQuaternions(a: any, b: any): this;
    slerp(qb: any, t: any): this;
    slerpQuaternions(qa: any, qb: any, t: any): this;
    random(): this;
    equals(quaternion: any): boolean;
    fromArray(array: any, offset?: number): this;
    toArray(array?: any[], offset?: number): any[];
    _onChange(callback: any): this;
    _onChangeCallback(): void;
    [Symbol.iterator](): Generator<number, void, unknown>;
}
