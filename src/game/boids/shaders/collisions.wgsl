@compute @workgroup_size(64)
fn collisionMain(@builtin(global_invocation_id) global_id: vec3<u32>) {
    let index = global_id.x;
}