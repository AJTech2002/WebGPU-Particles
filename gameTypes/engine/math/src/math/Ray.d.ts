export class Ray {
    constructor(origin?: Vector3, direction?: Vector3);
    origin: Vector3;
    direction: Vector3;
    set(origin: any, direction: any): this;
    copy(ray: any): this;
    at(t: any, target?: Vector3): Vector3;
    lookAt(v: any): this;
    recast(t: any): this;
    closestPointToPoint(point: any, target?: Vector3): Vector3;
    distanceToPoint(point: any): number;
    distanceSqToPoint(point: any): number;
    distanceSqToSegment(v0: any, v1: any, optionalPointOnRay: any, optionalPointOnSegment: any): number;
    intersectSphere(sphere: any, target?: Vector3): Vector3 | null;
    intersectsSphere(sphere: any): boolean;
    distanceToPlane(plane: any): number | null;
    intersectPlane(plane: any, target: any): Vector3 | null;
    intersectsPlane(plane: any): boolean;
    intersectBox(box: any, target: any): Vector3 | null;
    intersectsBox(box: any): boolean;
    intersectTriangle(a: any, b: any, c: any, backfaceCulling: any, target: any): Vector3 | null;
    applyMatrix4(matrix4: any): this;
    equals(ray: any): any;
    clone(): any;
}
import { Vector3 } from './Vector3.js';
