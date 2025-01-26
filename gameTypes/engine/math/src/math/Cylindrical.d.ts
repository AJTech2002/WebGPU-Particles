/**
 * Ref: https://en.wikipedia.org/wiki/Cylindrical_coordinate_system
 */
export class Cylindrical {
    constructor(radius?: number, theta?: number, y?: number);
    radius: number;
    theta: number;
    y: number;
    set(radius: any, theta: any, y: any): this;
    copy(other: any): this;
    setFromVector3(v: any): this;
    setFromCartesianCoords(x: any, y: any, z: any): this;
    clone(): any;
}
