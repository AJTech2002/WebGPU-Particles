struct UniformData {
    view: mat4x4<f32>,
    projection: mat4x4<f32>,
    time: f32,
};

struct ObjectData {
    model: array<mat4x4<f32>>,
}


@binding(0) @group(0) var<uniform> uniformUBO: UniformData;
@binding(1) @group(0) var<storage, read> objects: ObjectData; 
@binding(2) @group(0) var characterTexture: texture_2d<f32>;
@binding(3) @group(0) var characterSampler: sampler;

struct Fragment {
    @builtin(position) Position : vec4<f32>,
    @location(0) Color : vec4<f32>,
    @location(1) ScreenPos: vec4<f32>,
    @location(2) UV: vec2<f32>,
    
};

fn randomColor(id: u32) -> vec4<f32> {
    var r = f32((id * 123) % 155) / 155.0;
    r = r * 0.7 + 0.5;
    return vec4<f32>(r, r, r, 1.0);
}

@vertex
fn vs_main( @builtin(instance_index) ID: u32, @location(0) vertexPostion: vec3<f32>, @location(1) uv : vec2<f32>) -> Fragment {
    var output : Fragment;

    var idToF32 = f32(ID);
    var col = randomColor(ID * 23);


    output.Position = uniformUBO.projection * uniformUBO.view * objects.model[ID] * vec4<f32>(vertexPostion , 1.0);
 
    output.Color = col;
    output.UV = vec2<f32>(uv.x, 1.0 - uv.y);

    output.ScreenPos = output.Position;

    return output;
}

@fragment
fn fs_main(@location(0) Color: vec4<f32> ,@location(1) ScreenPos: vec4<f32>, @location(2) UV: vec2<f32>) -> @location(0) vec4<f32> {
    var col = textureSample(characterTexture, characterSampler, UV.xy);
    col = col * Color;
    if (col.a < 0.1) {
        discard;
    }
    return col;
}
