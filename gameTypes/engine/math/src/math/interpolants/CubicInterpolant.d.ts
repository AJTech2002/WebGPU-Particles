/**
 * Fast and simple cubic spline interpolant.
 *
 * It was derived from a Hermitian construction setting the first derivative
 * at each sample position to the linear slope between neighboring positions
 * over their parameter interval.
 */
export class CubicInterpolant extends Interpolant {
    _weightPrev: number;
    _offsetPrev: number;
    _weightNext: number;
    _offsetNext: number;
    DefaultSettings_: {
        endingStart: number;
        endingEnd: number;
    };
    intervalChanged_(i1: any, t0: any, t1: any): void;
    interpolate_(i1: any, t0: any, t: any, t1: any): any;
}
import { Interpolant } from '../Interpolant.js';
