
fn unique_direction(index: u32, numCount: u32) -> vec3<f32> {
    // Convert index and numCount to float for calculations
    let i = f32(index);
    let n = f32(numCount);

    // Compute the angle based on the index and numCount
    let angle = (i / n) * 2.0 * 3.141592653589793;

    // Calculate the direction vector using sin and cos
    let direction = vec3<f32>(cos(angle), sin(angle), 0.0);

    return direction;
}

@compute @workgroup_size(64)
fn avoidanceMain(@builtin(global_invocation_id) global_id: vec3<u32>) {
  let index = global_id.x;

  var timeClampedToInt = u32(clamp(time, 0.0, f32(100000)));

  let objectModelLength: u32 = u32(clamp(numBoids, 0.0, f32(100000)));

  if (index < objectModelLength) {

    var avoidance = vec3(0.0, 0.0, 0.0);
    var avoidanceDistance = 0.23;
    var minimumCompresion = 0.1;
    var avPwr = 1.2;
    var randomDirection = unique_direction(index, objectModelLength);
    //var angle = f32(random_u32(&local_rnd_state)*index) * 0.01;

    randomDirection = safe_normalize(randomDirection);
    var numBoidsAvoided = 0.0;
    
    var bP = boids[index].position;
   
    for (var i = 0u; i < objectModelLength; i = i + 1u) {
      if (i != index) {
        var bP2 = boids[i].position;

        var d = distance(bP, bP2);
        if (d == 0) {
          randomDirection = safe_normalize(randomDirection);
          var pushStrength = avoidanceDistance;
          avoidance += randomDirection * pushStrength;
        }
       
        else if (d < avoidanceDistance ) {
          var avVector = (bP - boids[i].position).xyz;
          // Normalize to get only the direction
          let direction = safe_normalize(avVector);
          // var pushStrength = clamp(1.0 - (d/avoidanceDistance), 0.0, 1.0);
          // var pushStrength = pow(1.0 - (d/avoidanceDistance), -avPwr);
          var pushStrength = avoidanceDistance - d;

          avVector = direction * pushStrength;
          avoidance = avoidance + avVector;
        } 
      }
    }

    avoidance.z = 0.0;
    // let minAv = vec3<f32>(-1.0, -1.0, 0.0);
    // let maxAv = vec3<f32>(1.0, 1.0, 0.0);
    // avoidance = clamp(avoidance, minAv, maxAv);
    // avoidance = safe_normalize(avoidance);
    boids[index].avoidanceVector = vec4<f32>(avoidance, 0.0);
  }

  return;
}

@compute @workgroup_size(64)
fn movementMain (@builtin(global_invocation_id) global_id: vec3<u32>) {
  let index = global_id.x;
  let objectModelLength: u32 = u32(clamp(numBoids, 0.0, f32(100000)));

  if (index < objectModelLength ) {

    var targetWeight = 1.0;
    let avoidanceWeight = 40.0;

    // Properties
    let boidPosition = boids[index].position.xyz;
    let avoidance = boids[index].avoidanceVector.xyz;
    let targetP = boid_input[index].targetPosition.xyz;
    let boidSpeed = boid_input[index].speed;
    let lastVisualBoidPosition = boids[index].lastModelPosition;
    let inputExternalForce = boid_input[index].externalForce.xyz;

    boids[index].externalForce += vec4<f32>(inputExternalForce, 0.0);
    
    // Movement clamping vars
    let minAv = vec3<f32>(-1.0, -1.0, 0.0);
    let maxAv = vec3<f32>(1.0, 1.0, 0.0);
    let minV3 = vec3<f32>(-boidSpeed, -boidSpeed, 0.0);
    let maxV3 = vec3<f32>(boidSpeed, boidSpeed, 0.0);

    // Calculate the direction to the target
    var movDir = (targetP - boidPosition);
    let distanceToTarget = length(movDir);
    movDir = clamp(movDir, minAv, maxAv);

    if (boid_input[index].hasTarget == 0u) {
      targetWeight = 0.0;
    }

    var v = (avoidance * avoidanceWeight) + (movDir*targetWeight);
    var dir = v; // * dT;
    dir = clamp(dir, minV3 ,maxV3 )* dT;

    var finalPos = boidPosition + dir;

    //TODO: Handle external forces
    var outputPos = vec4<f32>((finalPos + (boids[index].collisionVector.xyz) + (boids[index].externalForce.xyz * dT)), 0.0);
    var lastModelPos = get_position(objects[index].model);

    // var lerpSpeed = dT * mix(0.0, 10.0, clamp(distance(outputPos.xyz, lastModelPos)/0.1, 0.0, 1.0)); 
    var lerpSpeed = dT * 20.0;

    if (length(boids[index].collisionVector) > 0.0) {
      lerpSpeed = dT * 25.0;
    }

    var lerped = mix(lastModelPos, outputPos.xyz, lerpSpeed); 
    boids[index].lastModelPosition = vec4<f32>(lerped, 0.0);
    boids[index].position = outputPos;
    boid_output[index].position = outputPos.xyz;

    // Reset + Prepare for next frame
    boids[index].avoidanceVector = vec4<f32>(0.0, 0.0, 0.0, 0.0);
    boids[index].externalForce = mix(boids[index].externalForce, vec4<f32>(0.0, 0.0, 0.0, 0.0), 10.0 * dT);
    boids[index].collisionVector = vec4<f32>(0.0, 0.0, 0.0, 0.0);

    // Color/Data transfer
    objects[index].model = set_position(objects[index].model,lerped);

    let input_scale = boid_input[index].scale;
    objects[index].model = set_scale(objects[index].model, vec3<f32>(input_scale, input_scale, input_scale));
    objects[index].diffuseColor = boid_input[index].diffuseColor.xyz;
  }

  return;
}

