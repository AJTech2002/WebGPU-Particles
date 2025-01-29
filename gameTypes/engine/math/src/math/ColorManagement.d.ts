export function SRGBToLinear(c: any): number;
export function LinearToSRGB(c: any): number;
export namespace ColorManagement {
    let legacyMode: boolean;
    let workingColorSpace: string;
    function convert(color: any, sourceColorSpace: any, targetColorSpace: any): any;
    function fromWorkingColorSpace(color: any, targetColorSpace: any): any;
    function toWorkingColorSpace(color: any, sourceColorSpace: any): any;
}
