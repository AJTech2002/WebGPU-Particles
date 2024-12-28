        

        var avoidance = boids[index].avoidanceVector.xyz;
        avoidance.z = 0.0;

        var defaultSpeed = 1 * dT * boids[index].speed;

        // var movementDirection = (boids[index].targetPosition.xyz - get_position(objects[index].model)) + avoidance;
        var targetWeight = 0.1;
        let avoidanceWeight = 0.4;

        var targetP = boids[index].targetPosition.xyz;
        var movDir = (targetP - get_position(objects[index].model));

        // check distance to target 
        if (distance(get_position(objects[index].model), targetP) < 0.5) {
            movDir = vec3(0.0, 0.0, 0.0);
        }


        if (boids[index].hasTarget == 0u) {
            targetWeight = 0.0;
        }

        var movementDirection = safe_normalize(movDir * targetWeight + avoidance * avoidanceWeight);

        // clamp length without normalizing
        if (length(movementDirection) > 1.0) {
            movementDirection = safe_normalize(movementDirection);
        }


        var destination = get_position(objects[index].model) + movementDirection;
        
        var lastPosition = get_position(objects[index].model);
        
        objects[index].model = move_towards(objects[index].model, destination, defaultSpeed);



        var newPosition = get_position(objects[index].model);

        var velocity = newPosition - lastPosition;

        var speed = length(velocity) / dT;

        var avoidanceLength = length(avoidance) / 0.5;



        // scale x by avoidance length, so it looks like boid is getting squished

        var s = 0.3 - avoidanceLength;
        s = max(0.23, s);
        s = min(0.3, s);

        var target_scale = vec3<f32>(s, 0.3, 0.3);
        var current_scale = get_scale(objects[index].model);

        // lerp
        var scale = mix(current_scale, target_scale, 15.0 * dT);

        objects[index].model = set_scale(objects[index].model, scale);