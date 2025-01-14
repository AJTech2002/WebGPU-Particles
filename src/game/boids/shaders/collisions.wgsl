
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

fn box_collision (unit_position: vec3<f32>, center: vec3<f32>, extents: vec3<f32>, model: mat4x4<f32>, inverted: mat4x4<f32>) -> vec3<f32> {
  let local_position = (inverted * vec4<f32>(unit_position, 1.0)).xyz;
  let local_center = (inverted * vec4<f32>(center, 1.0)).xyz;

  let half_extents =  vec2<f32>(extents.x * 0.5, extents.y * 0.5);

  let closestX = clamp(local_position.x, local_center.x - half_extents.x, local_center.x + half_extents.x);
  let closestY = clamp(local_position.y, local_center.y - half_extents.y, local_center.y + half_extents.y);

  let p = vec2<f32>(closestX, closestY);

  // Distance Check
  let distance_ = distance(local_position.xy, p);

  if (distance_ > 1e-6) {
    return vec3<f32>(0.0, 0.0, 0.0);
  }

  if (distance_ < 1e-6) {
    // dif to closest
    var closestEdge = vec2<f32>(0.0, 0.0);

    if (local_position.x < local_center.x) {
      closestEdge.x = local_center.x - half_extents.x;
    }
    else if (local_position.x > local_center.x) {
      closestEdge.x = local_center.x + half_extents.x;
    }

    if (local_position.y < local_center.y) {
      closestEdge.y = local_center.y - half_extents.y;
    }
    else if (local_position.y > local_center.y) {
      closestEdge.y = local_center.y + half_extents.y;
    }

    let horizontal = vec2<f32>(closestEdge.x, local_position.y);
    let vertical = vec2<f32>(local_position.x, closestEdge.y);

    let horizontal_distance = distance(local_position.xy, horizontal);
    let vertical_distance = distance(local_position.xy, vertical);

    if (horizontal_distance < vertical_distance) {
      closestEdge = horizontal;
    }
    else {
      closestEdge = vertical;
    }

    let outward_world = (model * vec4<f32>(closestEdge, 0.0, 1.0)).xyz; 
    return outward_world - unit_position;
  }

  let normal_3 = vec3<f32>(local_position.xy - p, 0.0);

  let normal = safe_normalize(normal_3);
  let penetration = distance_;
  let avoidance = normal * penetration;

  // Re-project the avoidance vector back to world space
  let world_avoidance = (model * vec4<f32>(avoidance, 0.0)).xyz;
  return world_avoidance;
}


@compute @workgroup_size(64)
fn collisionMain(@builtin(global_invocation_id) global_id: vec3<u32>) {
  let index = global_id.x;
  var unitPosition = boids[index].position.xyz; 
  var collisionOffset = vec3<f32>(0.0, 0.0, 0.0);
  let objectModelLength: u32 = u32(clamp(numColliders, 0.0, f32(100000)));

  // Loop through all colliders in scene `colliders`
  for (var i = 0u; i < objectModelLength; i = i + 1u) {
    var center_pos = get_position(colliders[i].model);
    var scale = get_scale(colliders[i].model);
    center_pos.z = unitPosition.z;
    var center = center_pos.xyz;

    if (colliders[i].shape == 1u) {
      var avoidance = circle_collision(unitPosition, center, colliders[i].size.x * scale.x);
      avoidance.z = 0.0;
      unitPosition = unitPosition + avoidance;
      collisionOffset = collisionOffset + avoidance;
    }
    else if (colliders[i].shape == 0u) {
      var avoidance = box_collision(unitPosition, center, colliders[i].size, colliders[i].model, colliders[i].inverted);
      avoidance.z = 0.0;
      unitPosition = unitPosition + avoidance;
      collisionOffset = collisionOffset + avoidance;
    }

  }
 
  boids[index].collisionVector = vec4<f32>(collisionOffset, 0.0);
}
