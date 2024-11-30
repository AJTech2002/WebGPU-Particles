import { mat4, vec3 } from "gl-matrix"

export class TriangleMesh {

    buffer: GPUBuffer
    bufferLayout: GPUVertexBufferLayout
    vertices: Float32Array
    vertexCount: number

    object_data: Float32Array
    triangleCount: number

    instances: mat4[] = []

    constructor(device: GPUDevice) {
        // x y z r g b

        // SQUARE VERTICES
        this.vertices = new Float32Array([
            -0.5, -0.5, 0.0, 1.0, 0.0, 0.0,
            0.5, -0.5, 0.0, 0.0, 1.0, 0.0,
            -0.5, 0.5, 0.0, 0.0, 0.0, 1.0,
            0.5, -0.5, 0.0, 0.0, 1.0, 0.0,
            0.5, 0.5, 0.0, 0.0, 0.0, 1.0,
            -0.5, 0.5, 0.0, 1.0, 0.0, 0.0,
        ]);

        let triCount = 10000;

        this.object_data = new Float32Array(triCount * 10);
        this.triangleCount = 0;

        this.vertexCount = this.vertices.length / 6;

        const usage: GPUBufferUsageFlags = GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST;

        //VERTEX: the buffer can be used as a vertex buffer
        //COPY_DST: data can be copied to the buffer

        const descriptor: GPUBufferDescriptor = {
            size: this.vertices.byteLength,
            usage: usage,
            mappedAtCreation: true // similar to HOST_VISIBLE, allows buffer to be written by the CPU
        };

        this.buffer = device.createBuffer(descriptor);

        //Buffer has been created, now load in the vertices
        new Float32Array(this.buffer.getMappedRange()).set(this.vertices);
        this.buffer.unmap();

        //now define the buffer layout
        this.bufferLayout = {
            arrayStride: 24,
            attributes: [
                {
                    shaderLocation: 0,
                    format: "float32x3",
                    offset: 0
                },
                {
                    shaderLocation: 1,
                    format: "float32x3",
                    offset: 12
                }
            ]
        }

        var triangleCount = 0;
        for (var y: number = 0; y < triCount; y++) {
            let model = mat4.create();
            mat4.translate(model, model, [y * 1.5,Math.sin(y*3),-10]);
            mat4.scale(model, model, [0.2,0.2,0.2]);
            // console.log(mat4.getTranslation(vec3.create(), model));
            
            this.instances.push(model);
            
            for (var j: number = 0; j < 16; j++) {
                this.object_data[16 * triangleCount + j] = <number>model.at(j)
            }

            triangleCount++;
        }

        this.triangleCount = triangleCount;
        console.log(this.object_data)
    }
}