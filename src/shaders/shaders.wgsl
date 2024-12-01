struct TransformData {
    view: mat4x4<f32>,
    projection: mat4x4<f32>,
};

struct ObjectData {
    model: array<mat4x4<f32>>,
}


@binding(0) @group(0) var<uniform> transformUBO: TransformData;
@binding(1) @group(0) var<storage, read> objects: ObjectData; // This is the 1

struct Fragment {
    @builtin(position) Position : vec4<f32>,
    @location(0) Color : vec4<f32>,
    @location(1) ScreenPos: vec4<f32>
};

fn randomColor(id: u32) -> vec4<f32> {
    var r = f32(id % 255) / 255.0;
    var g = f32((id / 255) % 255) / 255.0;
    var b = f32((id / (255 * 255)) % 255) / 255.0;
    return vec4<f32>(r, g, b, 1.0);
}

@vertex
fn vs_main( @builtin(instance_index) ID: u32, @location(0) vertexPostion: vec3<f32>) -> Fragment {


    var output : Fragment;

    var idToF32 = f32(ID);

    output.Position = transformUBO.projection * transformUBO.view * objects.model[ID] * vec4<f32>(vertexPostion, 1.0);
    

    var col = randomColor(ID * 23);

    output.Color = col;

    output.ScreenPos = output.Position;

    return output;
}

@fragment
fn fs_main(@location(0) Color: vec4<f32> ,@location(1) ScreenPos: vec4<f32>) -> @location(0) vec4<f32> {
    // // Transform screenPosition to normalized device coordinates
    // let uv = ScreenPos.xy * 0.5 + vec2<f32>(0.5, 0.5);
    // let center = vec2<f32>(0.5, 0.5);
    // let radius = 0.2;
    // let dist = length(uv - center);

    // // Render a red circle if within radius, otherwise show vertex color
    // if (dist < radius) {
    //     return vec4<f32>(1.0, 0.0, 0.0, 1.0);
    // }
    // return vec4<f32>(ScreenPos.xy, 1.0, 1.0); // return the input color as a fallback
    return Color;
}
