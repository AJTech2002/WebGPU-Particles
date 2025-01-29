export class Box2 {
    constructor(min?: Vector2, max?: Vector2);
    isBox2: boolean;
    min: Vector2;
    max: Vector2;
    set(min: any, max: any): this;
    setFromPoints(points: any): this;
    setFromCenterAndSize(center: any, size: any): this;
    clone(): any;
    copy(box: any): this;
    makeEmpty(): this;
    isEmpty(): boolean;
    getCenter(target?: Vector2): Vector2;
    getSize(target?: Vector2): Vector2;
    expandByPoint(point: any): this;
    expandByVector(vector: any): this;
    expandByScalar(scalar: any): this;
    containsPoint(point: any): boolean;
    containsBox(box: any): boolean;
    getParameter(point: any, target: any): any;
    intersectsBox(box: any): boolean;
    clampPoint(point: any, target: any): any;
    distanceToPoint(point: any): number;
    intersect(box: any): this;
    union(box: any): this;
    translate(offset: any): this;
    equals(box: any): any;
}
import { Vector2 } from './Vector2.js';
