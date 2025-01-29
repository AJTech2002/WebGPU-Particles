/**
 * Abstract base class of interpolants over parametric samples.
 *
 * The parameter domain is one dimensional, typically the time or a path
 * along a curve defined by the data.
 *
 * The sample values can have any dimensionality and derived classes may
 * apply special interpretations to the data.
 *
 * This class provides the interval seek in a Template Method, deferring
 * the actual interpolation to derived classes.
 *
 * Time complexity is O(1) for linear access crossing at most two points
 * and O(log N) for random access, where N is the number of positions.
 *
 * References:
 *
 * 		http://www.oodesign.com/template-method-pattern.html
 *
 */
export class Interpolant {
    constructor(parameterPositions: any, sampleValues: any, sampleSize: any, resultBuffer: any);
    parameterPositions: any;
    _cachedIndex: number;
    resultBuffer: any;
    sampleValues: any;
    valueSize: any;
    settings: any;
    DefaultSettings_: {};
    evaluate(t: any): any;
    getSettings_(): any;
    copySampleValue_(index: any): any;
    interpolate_(): void;
    intervalChanged_(): void;
}
