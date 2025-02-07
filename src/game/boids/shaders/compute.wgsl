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

fn safe_random_normalize(v: vec3<f32>, a: vec3<f32>) -> vec3<f32> {
    let len = length(v);

    return select(v / len, vec3<f32> (
      snoise(a.xy),
      snoise(a.yz),
      snoise(a.zx)
    ) , len == 0.0);
}




@compute @workgroup_size(64)
fn avoidanceMain(@builtin(global_invocation_id) global_id: vec3<u32>) {
  let index = global_id.x;


  var timeClampedToInt = u32(clamp(time, 0.0, f32(100000)));

  let objectModelLength: u32 = u32(clamp(numBoids, 0.0, f32(100000)));

  if (index < objectModelLength) {

    if (boid_input[index].alive == 0u) {
      return;
    }

    var avoidance = vec3(0.0, 0.0, 0.0);
    var avoidanceDistance = boid_input[index].scale * 0.5;
    var minimumCompresion = 0.1;
    var avPwr = 1.8;
    var randomDirection = unique_direction(index, objectModelLength);
    //var angle = f32(random_u32(&local_rnd_state)*index) * 0.01;

    randomDirection = safe_normalize(randomDirection);
    var numBoidsAvoided = 0.0;
    
    var bP = boids[index].position;
   
    for (var i = 0u; i < objectModelLength; i = i + 1u) {
      if (i != index) {

        if (boid_input[i].alive == 0u) {
          continue;
        }

        var bP2 = boids[i].position;

        var d = distance(bP, bP2);
        if (d == 0) {
          randomDirection = safe_normalize(randomDirection);
          var pushStrength = avoidanceDistance;
          avoidance += randomDirection * pushStrength ;
        }
       
        else if (d < avoidanceDistance ) {
          var avVector = (bP - boids[i].position).xyz;
          // Normalize to get only the direction
          let direction = safe_normalize(avVector);
          // var pushStrength = clamp(1.0 - (d/avoidanceDistance), 0.0, 1.0);
          //var pushStrength = pow(1.0 - (d/avoidanceDistance), avPwr);

          // have the neighbour's scale affect the push strength
          var pushStrength = (avoidanceDistance - d);


          avVector = direction * pushStrength;
          avoidance = avoidance + avVector;
        } 
      }
    }

    avoidance.z = 0.0;
    // let minAv = vec3<f32>(-1.0, -1.0, 0.0);
    // let maxAv = vec3<f32>(1.0, 1.0, 0.0);
    // avoidance = clamp(avoidance, minAv, maxAv);
    boids[index].avoidanceVector = vec4<f32>(avoidance, 0.0);
  }

  return;
}

// declare const min/max scale
const minScale: f32 = 0.1;
const maxScale: f32 = 0.6;

@compute @workgroup_size(64)
fn movementMain (@builtin(global_invocation_id) global_id: vec3<u32>) {
  let index = global_id.x;
  let objectModelLength: u32 = u32(clamp(numBoids, 0.0, f32(100000)));

  if (index < objectModelLength ) {
    let input_scale = boid_input[index].scale;
    objects[index].model = set_scale(objects[index].model, vec3<f32>(input_scale, input_scale, input_scale));
    objects[index].diffuseColor = boid_input[index].diffuseColor;


    if (boid_input[index].alive == 0u) {
      return;
    }

    var targetWeight = 1.0;
    let avoidanceWeight = 12.0;

    // Properties
    let boidPosition = boids[index].position.xyz;
    var avoidance = boids[index].avoidanceVector.xyz;
    let targetP = boid_input[index].targetPosition.xyz;
    let boidSpeed = boid_input[index].speed;
    let lastVisualBoidPosition = boids[index].lastModelPosition;
    let inputExternalForce = boid_input[index].externalForce.xyz;

    var avoidanceMag = length(avoidance);

    avoidance = safe_normalize(avoidance);

    boids[index].externalForce += vec4<f32>(inputExternalForce, 0.0);
    
    // Movement clamping vars
    let minAv = vec3<f32>(-1.0, -1.0, 0.0);
    let maxAv = vec3<f32>(1.0, 1.0, 0.0);
    let minV3 = vec3<f32>(-boidSpeed, -boidSpeed, 0.0);
    let maxV3 = vec3<f32>(boidSpeed, boidSpeed, 0.0);

    // Calculate the direction to the target
    var movDir = (targetP - boidPosition);
    movDir.z = 0.0;
    let distanceToTarget = length(movDir);
    // movDir = safe_random_normalize(movDir, vec3<f32>(time * boidPosition.z * (f32(index) + 2), time * boidPosition.x * (f32(index) + 42), time * boidPosition.y * (f32(index) + 12)));
    movDir = safe_normalize(movDir);
    movDir = clamp(movDir, minAv, maxAv);

    if (boid_input[index].hasTarget == 0u || distanceToTarget < 0.01) {
      targetWeight = 0.0;
    }
    else {
      // scale down target with avoidance magnitude
      avoidanceMag = clamp(avoidanceMag, 0.0, 1.0);
      targetWeight = clamp(1.0 - (avoidanceMag * 0.5), 0.2, 1.0);
    }

    var v = (avoidance * avoidanceWeight ) + (movDir * targetWeight);
    var dir = v ; // * dT;
    dir = clamp(dir, minAv ,maxAv );

    var steering = mix(boids[index].steering.xyz, safe_normalize(dir), boid_input[index].steeringSpeed * dT);
    boids[index].steering = vec4<f32>(steering, 0.0);

    var finalPos = boidPosition + safe_normalize(steering) * length(dir) * boidSpeed * dT;

    var outputPos = vec4<f32>((finalPos + (boids[index].collisionVector.xyz) + (boids[index].externalForce.xyz * dT)), 0.0);
    // check if it is outside the boundary
    outputPos.x = clamp(outputPos.x, -gridWidth/2, gridWidth/2);
    outputPos.y = clamp(outputPos.y, -gridWidth/2, gridWidth/2);

    var lastModelPos = get_position(objects[index].model);

    // var lerpSpeed = dT * mix(0.0, 10.0, clamp(distance(outputPos.xyz, lastModelPos)/0.1, 0.0, 1.0)); 
    var lerpSpeed = dT * 10.0;

    if (length(boids[index].collisionVector) > 0.0) {
      lerpSpeed = dT * 20.0;
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

        
  }

  return;
}

