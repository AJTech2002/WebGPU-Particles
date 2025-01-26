export const DEG2RAD: number;
export const RAD2DEG: number;
export function generateUUID(): string;
export function clamp(value: any, min: any, max: any): number;
export function euclideanModulo(n: any, m: any): number;
export function mapLinear(x: any, a1: any, a2: any, b1: any, b2: any): any;
export function inverseLerp(x: any, y: any, value: any): number;
export function lerp(x: any, y: any, t: any): number;
export function damp(x: any, y: any, lambda: any, dt: any): number;
export function pingpong(x: any, length?: number): number;
export function smoothstep(x: any, min: any, max: any): number;
export function smootherstep(x: any, min: any, max: any): number;
export function randInt(low: any, high: any): any;
export function randFloat(low: any, high: any): any;
export function randFloatSpread(range: any): number;
export function seededRandom(s: any): number;
export function degToRad(degrees: any): number;
export function radToDeg(radians: any): number;
export function isPowerOfTwo(value: any): boolean;
export function ceilPowerOfTwo(value: any): number;
export function floorPowerOfTwo(value: any): number;
export function setQuaternionFromProperEuler(q: any, a: any, b: any, c: any, order: any): void;
export function normalize(value: any, array: any): any;
export function denormalize(value: any, array: any): any;
