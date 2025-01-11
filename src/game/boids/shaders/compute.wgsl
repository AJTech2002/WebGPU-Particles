
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

  if (index <  objectModelLength) {

    var avoidance = vec3(0.0, 0.0, 0.0);

    var avoidanceDistance = 0.18 * 2;
    var randomDirection = unique_direction(index, objectModelLength);
    //var angle = f32(random_u32(&local_rnd_state)*index) * 0.01;

    randomDirection = safe_normalize(randomDirection);
    var numBoidsAvoided = 0.0;
    var bP = objects[index].position;
    //bP.z = bP.y;
    bP.z = 0.0;
    for (var i = 0u; i < objectModelLength; i = i + 1u) {
      if (i != index) {
        var bP2 = objects[i].position;
        //bP2.z = bP2.y;
        bP2.z = 0.0;
        var d = distance(bP, bP2);

        if (d == 0) {
          randomDirection = safe_normalize(randomDirection) * avoidanceDistance;
          avoidance = avoidance +  (randomDirection *  avoidanceDistance);
        }
      else if (d < avoidanceDistance ) {
          var avVector = objects[index].position - objects[i].position;
          // Normalize to get only the direction
          let direction = safe_normalize(avVector);
          var pushStrength = clamp(avoidanceDistance - d, 0.0, 1.0);

          pushStrength *= (avoidanceDistance - d) / (avoidanceDistance);

          if (d < 0.1) {
            pushStrength = 1.0;
          }

          avVector = direction * pushStrength;
          avoidance = avoidance + avVector;
        } 
      }
    }

    //avoidance.y += avoidance.z;
    avoidance.z = 0.0;
    //avoidance = safe_normalize(avoidance) ;

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

    var targetWeight = 1.0;
    let avoidanceWeight = 10.0;

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

    var v = (avoidance * avoidanceWeight) + (movDir*targetWeight);


    var dir = v * dT; 

    var minV3 = vec3<f32>(-boids[index].speed, -boids[index].speed, 0.0);
    var maxV3 = vec3<f32>(boids[index].speed, boids[index].speed, 0.0);

    dir = clamp(dir, minV3  * dT,maxV3 * dT);

    var lastPosition = objects[index].position;
    var finalPos = lastPosition + dir;


    objects[index].position = finalPos;

    let distance = distance(objects[index].position, finalPos);


    boids[index].avoidanceVector = vec4<f32>(0.0, 0.0, 0.0, 0.0);
    var lerped = mix(lP, objects[index].position, dT * 15.00);
    objects[index].model = set_position(objects[index].model, lerped); 
  }

  return;
}

