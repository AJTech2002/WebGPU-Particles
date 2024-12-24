struct ObjectData {
    model: array<mat4x4<f32>>,
}

struct BoidComputeData {
    acceleration: vec4<f32>,
}

// Number of bytes: 32
struct BoidData {
    targetPosition: vec4<f32>, // 16 bytes
    avoidanceVector: vec4<f32>, // 16 bytes
    hasTarget: u32,            // 4 bytes
    speed: f32,               // 4 bytes
}

// the current state within this pixel
var<private> local_rnd_state:vec4u;

fn random_u32(state:ptr<private,vec4u>) -> u32 {
  var st:vec4u = *state;
  /* Algorithm "xor128" from p. 5 of Marsaglia, "Xorshift RNGs" */
  // Load the state from the storage buffer
  var t: u32 = st.w;
  var s: u32 = st.x;
  t ^= t << 11;
  t ^= t >> 8;
  var x:u32 = t ^ s ^ (s >> 19);
  *state = vec4u(
    x, s, st.y, st.z
  );
  return x;
}

fn random() -> f32 {
  return f32(random_u32(&local_rnd_state)) / 0x100000000;
}


@binding(0) @group(0) var<storage, read_write> objects: ObjectData;
@binding(1) @group(0) var<storage, read_write> boids: array<BoidData>;
@binding(2) @group(0) var<uniform> time: f32;
@binding(3) @group(0) var<uniform> dT: f32;

@compute @workgroup_size(64)
fn avoidanceMain(@builtin(global_invocation_id) global_id: vec3<u32>) {
    let index = global_id.x;

    local_rnd_state = vec4u(
        index + 1u,
        index + 2u,
        index + 3u,
        index + 4u
    );

    if (index < arrayLength(&objects.model) ) {

        var avoidance = vec3(0.0, 0.0, 0.0);

        var avoidanceDistance = 0.3;

        for (var i = 0u; i < arrayLength(&objects.model); i = i + 1u) {
            if (i != index) {
                // if the distance between the two objects is less than 0.1
                // move the object away from each other
                let distance = distance(get_position(objects.model[index]), get_position(objects.model[i]));
                
                if (distance == 0.0) {
                    // pick a random direction
                    var x = random();
                    var y = random();
                    var randomDirection = vec3(x, y, 0.0);
                    randomDirection = safe_normalize(randomDirection) * 0.01;
                    avoidance =  randomDirection;
                }
                else if (distance < avoidanceDistance) {
                    // objects.model[index] = move_towards(objects.model[index], get_position(objects.model[index]) - get_position(objects.model[i]), 0.01);
                    
                    var avVector = (get_position(objects.model[index]) - get_position(objects.model[i]));
                    avVector = safe_normalize(avVector);

                    // scale exponentially by distance 
                    // avVector = avVector * max(0.0, (avoidanceDistance - distance));
                    avVector = avVector * min((avoidanceDistance - distance), 0.1);

                    avoidance = avoidance + avVector;
                }
            }
        }

        var maxAvoidanceMagnitude = 1.0;
        
        avoidance.z = 0.0;
        // avoidance = safe_normalize(avoidance) * min(length(avoidance), maxAvoidanceMagnitude);
        
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
        

        var avoidance = boids[index].avoidanceVector.xyz;
        avoidance.z = 0.0;

        var defaultSpeed = 1 * dT * boids[index].speed;

        // var movementDirection = (boids[index].targetPosition.xyz - get_position(objects.model[index])) + avoidance;
        var targetWeight = 0.1;
        let avoidanceWeight = 0.4;

        var targetP = boids[index].targetPosition.xyz;
        var movDir = (targetP - get_position(objects.model[index]));

        // check distance to target 
        if (distance(get_position(objects.model[index]), targetP) < 0.5) {
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


        var destination = get_position(objects.model[index]) + movementDirection;
        
        var lastPosition = get_position(objects.model[index]);
        
        objects.model[index] = move_towards(objects.model[index], destination, defaultSpeed);



        var newPosition = get_position(objects.model[index]);

        var velocity = newPosition - lastPosition;

        var speed = length(velocity) / dT;

        var avoidanceLength = length(avoidance) / 0.5;



        // scale x by avoidance length, so it looks like boid is getting squished

        var s = 0.3 - avoidanceLength;
        s = max(0.23, s);
        s = min(0.3, s);

        var target_scale = vec3<f32>(s, 0.3, 0.3);
        var current_scale = get_scale(objects.model[index]);

        // lerp
        var scale = mix(current_scale, target_scale, 15.0 * dT);

        objects.model[index] = set_scale(objects.model[index], scale);

    
    }

    return;
}