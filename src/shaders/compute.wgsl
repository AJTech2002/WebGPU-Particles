struct ObjectData {
    model: array<mat4x4<f32>>,
}

@binding(0) @group(0) var<storage, read_write> objects: ObjectData;

@compute @workgroup_size(64)
fn computeMain(@builtin(global_invocation_id) global_id: vec3<u32>) {
    let index = global_id.x;
    if (index < arrayLength(&objects.model)) {
        // move to the left by 0.01 units
        // objects.model[index][3][0] -= 0.4;
        // objects.model[index] = translate(objects.model[index], vec3(-2, 0, 0));
        objects.model[index] = rotate(objects.model[index], 0.1, vec3(0,1,0));
        // objects.model[index] = move_towards(objects.model[index], vec3(0, 0, -5), 0.6);
    }

    return;
}