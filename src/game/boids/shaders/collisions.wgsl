@compute @workgroup_size(64)
fn collisionMain(@builtin(global_invocation_id) global_id: vec3<u32>) {
  let index = global_id.x;
  var unitPosition = objects[index].position;
  let objectModelLength: u32 = u32(clamp(numColliders, 0.0, f32(100000)));

  // Loop through all colliders in scene `colliders`
  for (var i = 0u; i < objectModelLength; i = i + 1u) {
    var center_pos = get_position(colliders[i].model); 
    center_pos.z = unitPosition.z;
    var center = center_pos.xyz;

    let distance = distance(unitPosition, center);
    // if unitPosition is within the collider's radius (1.0)then move the unit away from the collider
    let radius = 1.0;
    if (distance < radius) {
      var direction = safe_normalize(unitPosition - center);
      direction.z = 0.0;

      let distance = radius - distance;
      let avoidance = direction * distance;
      unitPosition = unitPosition + avoidance ;
    }

  }

  objects[index].position = unitPosition;

}
