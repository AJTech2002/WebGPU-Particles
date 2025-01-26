export class Line3 {
    constructor(start?: Vector3, end?: Vector3);
    start: Vector3;
    end: Vector3;
    set(start: any, end: any): this;
    copy(line: any): this;
    getCenter(target: any): any;
    delta(target: any): any;
    distanceSq(): number;
    distance(): number;
    at(t: any, target: any): any;
    closestPointToPointParameter(point: any, clampToLine: any): number;
    closestPointToPoint(point: any, clampToLine: any, target: any): any;
    applyMatrix4(matrix: any): this;
    equals(line: any): any;
    clone(): any;
}
import { Vector3 } from './Vector3.js';
