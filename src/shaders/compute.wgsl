struct ObjectData {
    model: array<mat4x4<f32>>,
}

// Number of bytes: 32
struct BoidData {
    targetPosition: vec4<f32>, // 16 bytes
    avoidanceVector: vec4<f32>, // 16 bytes
    hasTarget: u32,            // 4 bytes
    _padding: array<u32, 3>,   // 12 bytes (ensures struct aligns to 16 bytes)
}

@binding(0) @group(0) var<storage, read_write> objects: ObjectData;
@binding(1) @group(0) var<storage, read_write> boids: array<BoidData>;

@compute @workgroup_size(64)
fn avoidanceMain(@builtin(global_invocation_id) global_id: vec3<u32>) {
    let index = global_id.x;
    if (index < arrayLength(&objects.model) ) {

        if (boids[index].hasTarget == 0u) {
            return;
        }

        var avoidance = vec3(0.0, 0.0, 0.0);

        var avoidanceDistance = 0.5;

        for (var i = 0u; i < arrayLength(&objects.model); i = i + 1u) {
            if (i != index) {
                // if the distance between the two objects is less than 0.1
                // move the object away from each other
                let distance = distance(get_position(objects.model[index]), get_position(objects.model[i]));
                if (distance < avoidanceDistance) {
                    // objects.model[index] = move_towards(objects.model[index], get_position(objects.model[index]) - get_position(objects.model[i]), 0.01);
                    
                    var avVector = (get_position(objects.model[index]) - get_position(objects.model[i]));
                    avVector = normalize(avVector);

                    // scale exponentially by distance 0.13 max
                    avVector = avVector * max(0.0, (avoidanceDistance - distance));

                    avoidance = avoidance + avVector;
                }
            }
        }

        var maxAvoidanceMagnitude = 1.0;
        
        avoidance.z = 0.0;
        // avoidance = normalize(avoidance) * min(length(avoidance), maxAvoidanceMagnitude);
        
        avoidance *= 1.0;
        

        boids[index].avoidanceVector = vec4<f32>(avoidance, 0.0);

        var defaultSpeed = 0.01;

        // let distance = distance(get_position(objects.model[index]), boids[index].targetPosition.xyz);
        // objects.model[index] = move_towards(objects.model[index], boids[index].targetPosition.xyz + avoidance, defaultSpeed);
    }

    return;
}



@compute @workgroup_size(64)
fn movementMain (@builtin(global_invocation_id) global_id: vec3<u32>) {
    let index = global_id.x;
    if (index < arrayLength(&objects.model) ) {
        if (boids[index].hasTarget == 0u) {
            return;
        }

        var avoidance = boids[index].avoidanceVector.xyz;
        avoidance.z = 0.0;

        var defaultSpeed = 0.01;

        // var movementDirection = (boids[index].targetPosition.xyz - get_position(objects.model[index])) + avoidance;
        let targetWeight = 0.1;
        let avoidanceWeight = 0.2;

        var targetP = boids[index].targetPosition.xyz;
        var movDir = (targetP - get_position(objects.model[index]));

        // check distance to target 
        if (distance(get_position(objects.model[index]), targetP) < 0.5) {
            movDir = vec3(0.0, 0.0, 0.0);
        }

        var movementDirection = safe_normalize(movDir * targetWeight + avoidance * avoidanceWeight);

        // clamp length without normalizing
        if (length(movementDirection) > 1.0) {
            movementDirection = safe_normalize(movementDirection);
        }

        var destination = get_position(objects.model[index]) + movementDirection;
        objects.model[index] = move_towards(objects.model[index], destination, defaultSpeed);
    }

    return;
}