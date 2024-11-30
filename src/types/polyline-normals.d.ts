// definition file for the package polyline-normals
declare module "polyline-normals" {
    import { vec3 } from "gl-matrix";
    export function getNormals(positions: any[], closed: boolean): vec3[];
    export function calculateNormals(positions: vec3[], closed: boolean, miterLimit: number): vec3[];
}