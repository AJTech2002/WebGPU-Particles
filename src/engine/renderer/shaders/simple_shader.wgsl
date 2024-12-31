struct UniformData {
    view: mat4x4<f32>,
    projection: mat4x4<f32>,
    time: f32,
};


@binding(0) @group(0) var<uniform> uniformUBO: UniformData; // Global UBO

// Material uniforms
@binding(0) @group(1) var <uniform> diffuseColor: vec4<f32>; // Diffuse color

@binding(0) @group(2) var<uniform> model: mat4x4<f32>; // Model UBVO


struct Fragment {
    @builtin(position) Position : vec4<f32>,
    @location(0) Color : vec4<f32>,
    @location(1) ScreenPos: vec4<f32>,
    @location(2) UV: vec2<f32>,
};

@vertex
fn vs_main( @location(0) vertexPostion: vec3<f32>, @location(1) uv : vec2<f32>) -> Fragment {
    var output : Fragment;
    output.Position = uniformUBO.projection * uniformUBO.view * model * vec4<f32>(vertexPostion , 1.0);
 
    output.Color = diffuseColor;
    output.UV = vec2<f32>(uv.x, 1.0 - uv.y);

    output.ScreenPos = output.Position;

    return output;
}

@fragment
fn fs_main(@location(0) Color: vec4<f32>, @location(1) ScreenPos: vec4<f32>, @location(2) UV: vec2<f32>) -> @location(0) vec4<f32> {
    var col = diffuseColor;
    return col;
}
