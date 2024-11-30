struct ObjectData {
    model: array<mat4x4<f32>>,
}

// Number of bytes: 32
struct BoidData {
    targetPosition: vec4<f32>,
    hasTarget: u32,
    _padding: array<u32, 3>,
}

@binding(0) @group(0) var<storage, read_write> objects: ObjectData;
@binding(1) @group(0) var<storage, read_write> boids: array<BoidData>;

@compute @workgroup_size(64)
fn computeMain(@builtin(global_invocation_id) global_id: vec3<u32>) {
    let index = global_id.x;
    if (index < arrayLength(&objects.model) ) {

        if (boids[index].hasTarget == 0u) {
            return;
        }

        // check if distance to target < 1
        let distanceToTarget = distance(get_position(objects.model[index]), boids[index].targetPosition.xyz);
        if (distanceToTarget > 1) {
            boids[index].hasTarget = 0u;
            return;
        }
        
        // move to the left by 0.01 units
        // objects.model[index][3][0] -= 0.4;
        // objects.model[index] = translate(objects.model[index], vec3(-2, 0, 0));
        // objects.model[index] = rotate(objects.model[index], 0.1, vec3(0,1,0));
        // objects.model[index] = move_towards(objects.model[index], vec3(0, 0, -5), 0.6);
        // objects.model[index] = move_towards(objects.model[index], boids[index].targetPosition.xyz, 0.01);

        // loop through all the other objects
        var avoidance = vec3(0.0, 0.0, 0.0);

        for (var i = 0u; i < arrayLength(&objects.model); i = i + 1u) {
            if (i != index) {
                // if the distance between the two objects is less than 0.1
                // move the object away from each other
                let distance = distance(get_position(objects.model[index]), get_position(objects.model[i]));
                if (distance < 0.13) {
                    // objects.model[index] = move_towards(objects.model[index], get_position(objects.model[index]) - get_position(objects.model[i]), 0.01);
                    avoidance = avoidance + (get_position(objects.model[index]) - get_position(objects.model[i]));
                }
            }
        }

        avoidance.z = 0.0;

        // move away using avoidance
        // objects.model[index] = move_towards(objects.model[index], get_position(objects.model[index]) + avoidance, 0.01);
        
        // also try to moe towards the target

        var defaultSpeed = 0.01;

        // speed up closer to target with a lerped speed
        let distance = distance(get_position(objects.model[index]), boids[index].targetPosition.xyz);


        objects.model[index] = move_towards(objects.model[index], boids[index].targetPosition.xyz + avoidance, defaultSpeed);

        // objects.model[index] = rotate_towards(objects.model[index], boids[index].targetPosition);
        // set position to target
        // objects.model[index][3] = vec4(boids[index].targetPosition, 1.0);

    }

    return;
}