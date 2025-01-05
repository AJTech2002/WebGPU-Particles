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
