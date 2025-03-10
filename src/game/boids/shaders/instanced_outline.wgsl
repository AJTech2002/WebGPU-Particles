struct UniformData {
    view: mat4x4<f32>,
    projection: mat4x4<f32>,
    time: f32,
};

@binding(0) @group(0) var<uniform> uniformUBO: UniformData;
@binding(0) @group(1) var<uniform> diffuseColor: vec4<f32>;

@binding(1) @group(1) var characterTexture: texture_2d_array<f32>;
@binding(2) @group(1) var characterSampler: sampler;

@binding(3) @group(1) var<uniform> uvOffset: vec2<f32>;
@binding(4) @group(1) var<uniform> uvScale: vec2<f32>;

@binding(5) @group(1) var<storage, read> objects: array<BoidObjectData>; 

@binding(0) @group(2) var<uniform> model: mat4x4<f32>;

struct Fragment {
    @builtin(position) Position : vec4<f32>,
    @location(0) Color : vec4<f32>,
    @location(1) ScreenPos: vec4<f32>,
    @location(2) UV: vec2<f32>,
    @interpolate(flat) @location(3) TextureIndex: u32
};

fn randomColor(id: u32) -> vec4<f32> {
    var r = f32((id * 129) % 255) / 255.0;
    var g = f32((id * 34) % 255) / 255.0;
    var b = f32((id * 12) % 255) / 255.0;

    return vec4<f32>(r, g, b, 1.0);
}

@vertex
fn vs_main( @builtin(instance_index) ID: u32, @location(0) vertexPostion: vec3<f32>, @location(1) uv : vec2<f32>) -> Fragment {
    var output : Fragment;
    var objModel = objects[ID].model;
    var pos = get_position(objModel);
    var scale = get_scale(objModel);
    var scaleMag = length(scale);

    objModel = set_scale(objModel, vec3<f32>(scale.x + 0.05, scale.y + 0.05, scale.z));
    objModel = translate(objModel, vec3<f32>(0.0, 0.0, 0.1));

    // Z-Sort
    var expectedScreenSpace = uniformUBO.projection * uniformUBO.view * model *  objModel * vec4<f32>(0.0, 0.0, 0.0 , 1.0);
    var y = ((expectedScreenSpace.y + 1.0) / 2.0)  / expectedScreenSpace.w;
    pos.z = -2;
    
    
    objModel = set_position(objModel, pos);

    output.Position =  uniformUBO.projection * uniformUBO.view * model * objModel * vec4<f32>(vertexPostion , 1.0);
    output.Color = objects[ID].outlineColor * objects[ID].diffuseColor.a; 
    output.UV = vec2<f32>(uv.x, 1.0 - uv.y);

    output.ScreenPos = output.Position;
    output.TextureIndex = objects[ID].textureIndex;
    return output;
}

@fragment
fn fs_main(
    @location(0) Color: vec4<f32>, 
    @location(1) ScreenPos: vec4<f32>,
    @location(2) UV: vec2<f32>,
    @interpolate(flat) @location(3) TextureIndex: u32    
) -> @location(0) vec4<f32> {

    var col = textureSample(characterTexture, characterSampler, UV.xy * uvScale + uvOffset, TextureIndex);
    let a = col.a * diffuseColor.a * Color.a;
    if (a < 0.05) {
        discard;
    }

    var outputCol = diffuseColor * Color;

    col = vec4<f32>(outputCol.xyz, a );

    return col;
}
