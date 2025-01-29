import { ArrayUniform } from "../renderer/uniforms";
import { BufferSchema, BufferSchemaDescriptor } from "./compute";
export declare class DynamicUniform<T> extends ArrayUniform<T> {
    private maxInstanceCount;
    private layout;
    private alignmentBytes;
    private mappedLayoutByKey;
    private schema;
    private isArrayed;
    private writeStagingBuffer;
    constructor(name: string, schema: BufferSchema<T>);
    static from<T extends object>(descriptor: BufferSchemaDescriptor<T>): DynamicUniform<T>;
    get schemaLayoutDescriptor(): any;
    protected setArrayData(index: number, data: T): void;
    setValue(value: T): void;
    setElement(index: number, value: T): void;
    upload(instanceCount: number): void;
    setElementPartial(index: number, value: Partial<T>, upload: boolean): void;
    private setArrayDataExact;
    protected getArrayData(index: number, f32Array: Float32Array): T | null;
    protected updateBuffer(): void;
}
