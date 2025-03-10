export class Triangle {
    static getNormal(a: any, b: any, c: any, target: any): any;
    static getBarycoord(point: any, a: any, b: any, c: any, target: any): any;
    static containsPoint(point: any, a: any, b: any, c: any): boolean;
    static getUV(point: any, p1: any, p2: any, p3: any, uv1: any, uv2: any, uv3: any, target: any): any;
    static isFrontFacing(a: any, b: any, c: any, direction: any): boolean;
    constructor(a?: Vector3, b?: Vector3, c?: Vector3);
    a: Vector3;
    b: Vector3;
    c: Vector3;
    set(a: any, b: any, c: any): this;
    setFromPointsAndIndices(points: any, i0: any, i1: any, i2: any): this;
    clone(): any;
    copy(triangle: any): this;
    getArea(): number;
    getMidpoint(target: any): any;
    getNormal(target: any): any;
    getPlane(target: any): any;
    getBarycoord(point: any, target: any): any;
    getUV(point: any, uv1: any, uv2: any, uv3: any, target: any): any;
    containsPoint(point: any): boolean;
    isFrontFacing(direction: any): boolean;
    intersectsBox(box: any): any;
    closestPointToPoint(p: any, target: any): any;
    equals(triangle: any): any;
}
import { Vector3 } from './Vector3.js';
