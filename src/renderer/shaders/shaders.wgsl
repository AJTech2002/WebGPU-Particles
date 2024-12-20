struct TransformData {
    view: mat4x4<f32>, // ALigns to 64 bytes
    projection: mat4x4<f32>,
    time: f32,
    // padding: vec2<f32> // Aligns to 64 bytes 
};

struct ObjectData {
    model: array<mat4x4<f32>>,
}


@binding(0) @group(0) var<uniform> transformUBO: TransformData;
@binding(1) @group(0) var<storage, read> objects: ObjectData; // This is the 1
@binding(2) @group(0) var characterTexture: texture_2d<f32>;
@binding(3) @group(0) var characterSampler: sampler;

@binding(4) @group(0) var<uniform> time: f32;

struct Fragment {
    @builtin(position) Position : vec4<f32>,
    @location(0) Color : vec4<f32>,
    @location(1) ScreenPos: vec4<f32>,
    @location(2) UV: vec2<f32>,
    
};

fn randomColor(id: u32) -> vec4<f32> {
    // generate a random color based on the object ID

    var r = f32((id * 123) % 155) / 155.0;
    // var g = f32((id * 321) % 155) / 155.0;
    // var b = f32((id * 213) % 155) / 155.0;

    // var b = f32((id * 213) % 255) / 255.0;

    // if (id % 2 == 0) {
    //     return vec4<f32>(72.0/255.0, 255.0/255.0, 146.0/255.0, 1.0);
    // }
    // else if (id % 3 == 0) {
    //     return vec4<f32>(106.0/255.0, 201.0/255.0, 238.0/255.0, 1.0);
    // }
    // else {
    //     return vec4<f32>(255.0/255.0, 56.0/255.0, 70.0/255.0, 1.0);
    // }

    // min 0.3
    // max 1.0
    // r = r * 0.7 + 0.3;
    // r = 10.0/time;

    r = r * 0.7 + 0.5;

    return vec4<f32>(r, r, r, 1.0);
}

@vertex
fn vs_main( @builtin(instance_index) ID: u32, @location(0) vertexPostion: vec3<f32>, @location(1) uv : vec2<f32>) -> Fragment {
    var output : Fragment;

    var idToF32 = f32(ID);
    var col = randomColor(ID * 23);


    output.Position = transformUBO.projection * transformUBO.view * objects.model[ID] * vec4<f32>(vertexPostion , 1.0);
 
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
