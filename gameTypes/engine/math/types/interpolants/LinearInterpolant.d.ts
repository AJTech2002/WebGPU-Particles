/**
 * Interpolant that evaluates to the sample value at the position preceding
 * the parameter.
 *
 * @examples
 * ```
 * const interpolant = new LinearInterpolant(
 * new Float32Array( 2 ),
 * new Float32Array( 2 ),
 * 1,
 * new Float32Array( 1 )
 * );
 *
 * interpolant.evaluate( 0.5 );
 * ```
 */
export class LinearInterpolant extends Interpolant {
    /**
     * Create a new instance.
     * @param parameterPositions - array of positions
     * @param sampleValues - array of samples
     * @param sampleSize - number of samples
     * @param resultBuffer - buffer to store the interpolation results.
     */
    constructor(parameterPositions: any, sampleValues: any, sampleSize: any, resultBuffer: any);
    interpolate_(i1: any, t0: any, t: any, t1: any): any[] | undefined;
    intervalChanged_(i1: any, t0: any, t1: any): void;
}
import { Interpolant } from '../Interpolant.js';
