// EXAMPLE SHADER

struct UniformData {
    view: mat4x4<f32>,
    projection: mat4x4<f32>,
    time: f32,
};

@binding(0) @group(0) var<uniform> uniformUBO: UniformData;

@vertex
fn vs_main( @location(0) vertexPostion: vec3<f32>, @location(1) uv : vec2<f32>) -> Fragment {
    var output : Fragment;
    output.Position = uniformUBO.projection * uniformUBO.view * model * vec4<f32>(vertexPostion , 1.0);
 
    output.Color = randomColor(0);
    output.UV = vec2<f32>(uv.x, 1.0 - uv.y);

    output.ScreenPos = output.Position;

    return output;
}

@fragment
fn fs_main(@location(0) Color: vec4<f32>, @location(1) ScreenPos: vec4<f32>, @location(2) UV: vec2<f32>) -> @location(0) vec4<f32> {
    return vec4<f32>(1.0, 0.0, 0.0, 1.0);
}
