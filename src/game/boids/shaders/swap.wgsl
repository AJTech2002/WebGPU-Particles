
@compute @workgroup_size(1)
fn swap(@builtin(global_invocation_id) id: vec3<u32>) {
    if (id.x == 0) {
        let temp = boids[i];
        boids[i] = boids[j];
        boids[j] = temp;

        let tempObj = objects[i];
        objects[i] = objects[j];
        objects[j] = tempObj;
    }
}


