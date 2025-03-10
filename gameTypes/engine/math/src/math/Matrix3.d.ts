export class Matrix3 {
    elements: number[];
    set(n11: any, n12: any, n13: any, n21: any, n22: any, n23: any, n31: any, n32: any, n33: any): this;
    identity(): this;
    copy(m: any): this;
    extractBasis(xAxis: any, yAxis: any, zAxis: any): this;
    setFromMatrix4(m: any): this;
    multiply(m: any): this;
    premultiply(m: any): this;
    multiplyMatrices(a: any, b: any): this;
    multiplyScalar(s: any): this;
    determinant(): number;
    invert(): this;
    transpose(): this;
    getNormalMatrix(matrix4: any): this;
    transposeIntoArray(r: any): this;
    setUvTransform(tx: any, ty: any, sx: any, sy: any, rotation: any, cx: any, cy: any): this;
    scale(sx: any, sy: any): this;
    rotate(theta: any): this;
    translate(tx: any, ty: any): this;
    makeTranslation(x: any, y: any): this;
    makeRotation(theta: any): this;
    makeScale(x: any, y: any): this;
    equals(matrix: any): boolean;
    fromArray(array: any, offset?: number): this;
    toArray(array?: any[], offset?: number): any[];
    clone(): any;
}
