//
// Description : Array and textureless WGSL 2D simplex noise function.
//      Author : Originally by Ian McEwan, Ashima Arts (GLSL).
//               Adapted to WGSL by ChatGPT.
//  Maintainer : stegu
//     License : Copyright (C) 2011 Ashima Arts.
//               Distributed under the MIT License.
//
// Note: This code snippet is intended as a helper library. 
//       You can call `snoise(v)` from within your shader as needed.
//

// WGSL doesn’t allow swizzling the same way GLSL does (e.g., .xxzz).
// For clarity, we build vectors manually where needed.

fn mod289_2(x: vec2f) -> vec2f {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
}

fn mod289_3(x: vec3f) -> vec3f {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
}

fn permute(x: vec3f) -> vec3f {
    // (x*34 + 10)*x mod289
    return mod289_3((x * 34.0 + 10.0) * x);
}

// 2D simplex noise
fn snoise(v: vec2f) -> f32 {
    // Setup constants (same values as in the GLSL version)
    let C = vec4f(
        0.211324865405187,  // (3.0 - sqrt(3.0)) / 6.0
        0.366025403784439,  // 0.5 * (sqrt(3.0) - 1.0)
        -0.577350269189626, // -1.0 + 2.0 * C.x
        0.024390243902439   // 1.0 / 41.0
    );

    // First corner
    let i   = floor(v + dot(v, vec2f(C.y, C.y)));
    let x0  = v - i + dot(i, vec2f(C.x, C.x));

    // For the second corner offset
    // If x0.x > x0.y then i1 = (1, 0), else i1 = (0, 1)
    let i1  = select(vec2f(0.0, 1.0), vec2f(1.0, 0.0), x0.x > x0.y);

    // x12 = (x0, x0) + (C.x, C.x, C.z, C.z)
    var x12 = vec4f(x0.x, x0.y, x0.x, x0.y) + vec4f(C.x, C.x, C.z, C.z);
    // x12.xy -= i1
    x12 = vec4f(
        x12.x - i1.x,
        x12.y - i1.y,
        x12.z,
        x12.w
    );

    // Permutation
    let i_mod = mod289_2(i);
    let p = permute(
                permute(
                    vec3f(
                        i_mod.y + 0.0, 
                        i_mod.y + i1.y, 
                        i_mod.y + 1.0
                    )
                ) 
                + vec3f(
                    i_mod.x + 0.0, 
                    i_mod.x + i1.x, 
                    i_mod.x + 1.0
                )
            );

    // m calculates falloff
    var m = max(
        vec3f(
            0.5 - dot(x0, x0),
            0.5 - dot(x12.xy, x12.xy),
            0.5 - dot(x12.zw, x12.zw)
        ),
        vec3f(0.0)
    );
    m = m * m;
    m = m * m;

    // Gradients
    let x = 2.0 * fract(p * C.w) - vec3f(1.0, 1.0, 1.0);
    let h = abs(x) - vec3f(0.5, 0.5, 0.5);
    let ox = floor(x + 0.5);
    let a0 = x - ox;

    // m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h)
    m = m * (1.79284291400159 - 0.85373472095314 * ((a0 * a0) + (h * h)));

    // Compute final contributions
    var g = vec3f(0.0, 0.0, 0.0);
    g.x = a0.x * x0.x + h.x * x0.y;
    g.y = a0.y * x12.x + h.y * x12.y;
    g.z = a0.z * x12.z + h.z * x12.w;

    // Sum up and scale
    return 130.0 * dot(m, g);
}
