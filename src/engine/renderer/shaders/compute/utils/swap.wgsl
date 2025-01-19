@compute @workgroup_size(1)
fn main(@builtin(global_invocation_id) id: vec3<u32>) {
    let i = 2; // Example index
    let j = 5; // Example index

    if (id.x == 0) {
        let temp = ${ARRAY}[i];
        ${ARRAY}[i] = ${ARRAY}[j];
        ${ARRAY}[j] = temp;
    }
}
