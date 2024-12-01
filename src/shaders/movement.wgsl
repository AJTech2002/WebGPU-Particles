struct ObjectData {
    model: array<mat4x4<f32>>,
}

// Number of bytes: 32
struct BoidData {
    targetPosition: vec4<f32>,
    hasTarget: u32,
    avoidanceVector: vec4<f32>,
    _padding: array<u32, 3>,
}

@binding(0) @group(0) var<storage, read_write> objects: ObjectData;
@binding(1) @group(0) var<storage, read_write> boids: array<BoidData>;

@compute @workgroup_size(64)
fn movementMain (@builtin(global_invocation_id) global_id: vec3<u32>) {
    let index = global_id.x;
    if (index < arrayLength(&objects.model) ) {
        if (boids[index].hasTarget == 0u) {
            return;
        }

        var avoidance = boids[index].avoidanceVector.xyz;

        avoidance.z = 0.0;

        objects.model[index].avoidanceVector = vec4<f32>(avoidance, 0.0);

        var defaultSpeed = 0.01;

        let distance = distance(get_position(objects.model[index]), boids[index].targetPosition.xyz);
        objects.model[index] = move_towards(objects.model[index], boids[index].targetPosition.xyz + avoidance, defaultSpeed);
    }

    return;
}