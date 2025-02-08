struct UniformData {
    view: mat4x4<f32>,
    projection: mat4x4<f32>,
    time: f32,
};


// World Bindings
@binding(0) @group(0) var<uniform> uniformUBO: UniformData;

// Material Bindings
@binding(0) @group(1) var<uniform> diffuseColor: vec4<f32>;
@binding(1) @group(1) var characterTexture: texture_2d<f32>;
@binding(2) @group(1) var characterSampler: sampler;
@binding(3) @group(1) var<uniform> uvOffset: vec2<f32>;
@binding(4) @group(1) var<uniform> uvScale: vec2<f32>;
@binding(5) @group(1) var <uniform> outlineWidth: f32; // Outline width

// Model Bindings
@binding(0) @group(2) var<uniform> model: mat4x4<f32>;


struct Fragment {
    @builtin(position) Position : vec4<f32>,
    @location(0) Color : vec4<f32>,
    @location(1) ScreenPos: vec4<f32>,
    @location(2) UV: vec2<f32>,
};


@vertex
fn vs_main( @location(0) vertexPostion: vec3<f32>, @location(1) uv : vec2<f32>) -> Fragment {
    var output : Fragment;

    var updatedModel = model;
    var scale = get_scale(updatedModel);
    updatedModel = set_scale(updatedModel, vec3<f32>(scale.x + outlineWidth, scale.y + outlineWidth, scale.z));
    updatedModel = translate(updatedModel, vec3<f32>(0.0, 0.0, -0.1));


    output.Position = uniformUBO.projection * uniformUBO.view * updatedModel * vec4<f32>(vertexPostion , 1.0);
    output.Color = vec4<f32>(1.0, 1.0, 1.0, 1.0); 
    output.UV = vec2<f32>(uv.x, 1.0 - uv.y);

    output.ScreenPos = output.Position;

    return output;
}

@fragment
fn fs_main(@location(0) Color: vec4<f32>, @location(1) ScreenPos: vec4<f32>, @location(2) UV: vec2<f32>) -> @location(0) vec4<f32> {
    // return vec4<f32>(1.0, 0.0, 0.0, 1.0);
    var col = textureSample(characterTexture, characterSampler, UV.xy * uvScale + uvOffset);
    let a = col.a;
    if (col.a < 0.001) {
        discard;
    }
    col = vec4<f32>(diffuseColor.xyz, a);

    return col;
}
