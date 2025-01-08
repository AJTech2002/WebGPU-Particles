
fn circle_collision (unit_position: vec3<f32>, center: vec3<f32>, collider_radius: f32) -> vec3<f32> {
  let distance = distance(unit_position, center);
  let radius = collider_radius;
  if (distance < radius) {
    var direction = safe_normalize(unit_position - center);
    direction.z = 0.0;

    let distance = radius - distance;
    let avoidance = direction * distance;
    return avoidance;
  }
  return vec3<f32>(0.0, 0.0, 0.0);
}


@compute @workgroup_size(64)
fn collisionMain(@builtin(global_invocation_id) global_id: vec3<u32>) {
  let index = global_id.x;
  var unitPosition = objects[index].position;
  let objectModelLength: u32 = u32(clamp(numColliders, 0.0, f32(100000)));

  // Loop through all colliders in scene `colliders`
  for (var i = 0u; i < objectModelLength; i = i + 1u) {
    var center_pos = get_position(colliders[i].model);
    var scale = get_scale(colliders[i].model);
    center_pos.z = unitPosition.z;
    var center = center_pos.xyz;

    if (colliders[i].shape == 1u) {
      let avoidance = circle_collision(unitPosition, center, colliders[i].size.x * scale.x);
      unitPosition = unitPosition + avoidance;
    }

  }

  objects[index].position = unitPosition;

}
