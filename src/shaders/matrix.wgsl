
fn translate(matrix: mat4x4<f32>, translation: vec3<f32>) -> mat4x4<f32> {
    // Add the translation vector to the last column of the matrix
    return mat4x4<f32>(
        matrix[0], // Keep the original X-axis
        matrix[1], // Keep the original Y-axis
        matrix[2], // Keep the original Z-axis
        vec4<f32>(
            matrix[3].x + translation.x, // Update translation component
            matrix[3].y + translation.y,
            matrix[3].z + translation.z,
            matrix[3].w              // Keep the homogeneous coordinate
        )
    );
}
fn safe_normalize(v: vec3<f32>) -> vec3<f32> {
    let len = length(v);
    return select(v / len, vec3<f32>(0.0), len == 0.0);
}

fn move_towards (matrix: mat4x4<f32>, towards: vec3<f32>, speed: f32) -> mat4x4<f32> {
  let position = matrix[3].xyz;
  var translation = safe_normalize(towards - position) * speed;
  return translate(matrix, translation);
}

fn rotate(matrix: mat4x4<f32>, angle: f32, _axis: vec3<f32>) -> mat4x4<f32> {
    let c = cos(angle);
    let s = sin(angle);
    let t = 1.0 - c;

    let axis = normalize(_axis);
    let x = axis.x;
    let y = axis.y;
    let z = axis.z;

    let rotationMatrix = mat4x4<f32>(
        vec4<f32>(t * x * x + c,     t * x * y - s * z, t * x * z + s * y, 0.0),
        vec4<f32>(t * x * y + s * z, t * y * y + c,     t * y * z - s * x, 0.0),
        vec4<f32>(t * x * z - s * y, t * y * z + s * x, t * z * z + c,     0.0),
        vec4<f32>(0.0,               0.0,               0.0,               1.0)
    );

    return matrix * rotationMatrix;
}

fn rotate_towards (matrix: mat4x4<f32>, towards: vec3<f32>) -> mat4x4<f32> {
  let position = matrix[3].xyz;
  let direction = normalize(towards - position);
  let angle = acos(dot(vec3(0.0, 0.0, -1.0), direction));
  

  let axis = vec3(0.0, 0.0, -1.0);
  return rotate(matrix, angle, axis);
}

fn get_position (matrix: mat4x4<f32>) -> vec3<f32> {
  return matrix[3].xyz;
}

fn get_forward (matrix: mat4x4<f32>) -> vec3<f32> {
  return (matrix * vec4<f32>(0,1,0,1)).xyz;
}
