export class Spherical {
    constructor(radius?: number, phi?: number, theta?: number);
    radius: number;
    phi: number;
    theta: number;
    set(radius: any, phi: any, theta: any): this;
    copy(other: any): this;
    makeSafe(): this;
    setFromVector3(v: any): this;
    setFromCartesianCoords(x: any, y: any, z: any): this;
    clone(): any;
}
