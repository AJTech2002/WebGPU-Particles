struct ObjectData {
    model: mat4x4<f32>,
    position: vec3<f32>,
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


@binding(0) @group(0) var<storage, read_write> objects: array<ObjectData>;
@binding(1) @group(0) var<storage, read_write> boids: array<BoidData>;
@binding(2) @group(0) var<uniform> time: f32;
@binding(3) @group(0) var<uniform> dT: f32;
@binding(4) @group(0) var<uniform> numBoids: f32;

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
        var angle = f32(index) * 0.1;
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
        avoidance *= 3.0;

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

        var avoidance = boids[index].avoidanceVector.xyz;
        avoidance.z = 0.0;

        var minAv = vec3<f32>(-1.0, -1.0, 0.0);
        var maxAv = vec3<f32>(1.0, 1.0, 0.0);


        // var acceleration = clamp(offset, -1.0, 1.0);

        var v = clamp(avoidance, minAv, maxAv);
        var dir = v * dT * boids[index].speed;

        var minV3 = vec3<f32>(-boids[index].speed, -boids[index].speed, 0.0);
        var maxV3 = vec3<f32>(boids[index].speed, boids[index].speed, 0.0);

        dir = clamp(dir, minV3  * dT,maxV3 * dT);

        var lastPosition = objects[index].position;

        objects[index].position = lastPosition + dir;

        // get current position
        var lP = get_position(objects[index].model);

        // lerp towards position
        var lerped = mix(lP, objects[index].position, 10 * dT);

        objects[index].model = set_position(objects[index].model, lerped);
    }

    return;
}

