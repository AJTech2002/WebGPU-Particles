@compute @workgroup_size(64)
fn avoidanceMain(@builtin(global_invocation_id) global_id: vec3<u32>) {
    let index = global_id.x;

    local_rnd_state = vec4u(
        index % 89u,
        index % 122u,
        index % 323u,
        index % 23u
    );

    let objectModelLength: u32 = u32(clamp(numBoids, 0.0, f32(100000)));


    if (index <  objectModelLength) {

        var avoidance = vec3(0.0, 0.0, 0.0);

        var avoidanceDistance = 0.4;
        var randomDirection = vec3(0.0, 1.0, 0.0);
        var angle = f32(random_u32(&local_rnd_state)) * 0.01;
        randomDirection = rotate_v3(randomDirection, angle, vec3(0.0, 0.0, 1.0));

        for (var i = 0u; i < objectModelLength; i = i + 1u) {
            if (i != index) {
                let distance = distance(objects[index].position, objects[i].position);
                
                if (distance == 0.0) {
                    randomDirection = safe_normalize(randomDirection) * avoidanceDistance;
                    avoidance =  randomDirection;
                }
                else if (distance < avoidanceDistance) {
                    var avoidancePerc = clamp(avoidanceDistance - distance, 0.0, 1.0);
                    avoidancePerc = pow(avoidancePerc / avoidanceDistance, 2.0); // Exponential curve

                    // avoidancePerc = clamp(avoidancePerc, 0.5, 1.0);

                    var avVector = (objects[index].position - objects[i].position);
                    avVector = safe_normalize(avVector);

                    avVector = avVector * avoidancePerc;
                    avoidance = avoidance + avVector;
                }
            }
        }

        
        avoidance.z = 0.0;
        avoidance *= 5.0;

        boids[index].avoidanceVector = vec4<f32>(avoidance, 0.0);

        var defaultSpeed = 0.01;

        // let distance = distance(get_position(objects[index].model), boids[index].targetPosition.xyz);
        // objects[index].model = move_towards(objects[index].model, boids[index].targetPosition.xyz + avoidance, defaultSpeed);
    }

    return;
}



@compute @workgroup_size(64)
fn movementMain (@builtin(global_invocation_id) global_id: vec3<u32>) {
    let index = global_id.x;

    let objectModelLength: u32 = u32(clamp(numBoids, 0.0, f32(100000)));


    if (index < objectModelLength ) {

        var targetWeight = 0.2;
        let avoidanceWeight = 0.8;

        var avoidance = boids[index].avoidanceVector.xyz;
        avoidance.z = 0.0;

        var minAv = vec3<f32>(-1.0, -1.0, 0.0);
        var maxAv = vec3<f32>(1.0, 1.0, 0.0);

        var targetP = boids[index].targetPosition.xyz;
        var lP = get_position(objects[index].model);
        
        var movDir = (targetP - objects[index].position);
        let distanceToTarget = length(movDir);
       

        movDir = clamp(movDir, minAv, maxAv);

        if (boids[index].hasTarget == 0u) {
            targetWeight = 0.0;
        }

        var v = clamp((avoidance * avoidanceWeight) + (movDir*targetWeight), minAv, maxAv);


        var dir = v * dT * boids[index].speed;

        var minV3 = vec3<f32>(-boids[index].speed, -boids[index].speed, 0.0);
        var maxV3 = vec3<f32>(boids[index].speed, boids[index].speed, 0.0);

        dir = clamp(dir, minV3  * dT,maxV3 * dT);

        var lastPosition = objects[index].position;
        var finalPos = lastPosition + dir;


        objects[index].position = finalPos;

        let distance = distance(objects[index].position, finalPos);

        var lerped = mix(lP, objects[index].position, dT * 2.0);

        objects[index].model = set_position(objects[index].model, lerped);
        boids[index].avoidanceVector = vec4<f32>(0.0, 0.0, 0.0, 0.0);
      
    }

    return;
}

