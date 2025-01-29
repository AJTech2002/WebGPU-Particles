
@compute @workgroup_size(1)
fn raycast_collider(@builtin(global_invocation_id) id: vec3<u32>) {
    let index = id.x;
    let ray_origin = input.start;
    let ray_direction = input.direction;
    let ray_length = input.distance;
    let collider = colliders[index];

    var center_pos = get_position(colliders[i].model);
    var scale = get_scale(colliders[i].model);
    center_pos.z = 0.0;

    if (collider.shape == 0u) {

    }
}


