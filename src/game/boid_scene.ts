import Engine from "@engine/engine";
import Scene from "@engine/scene";
import GameObject from "@engine/scene/gameobject";
import BoidSystemComponent from "./boids/boid_system";
import { QuadMesh } from "@engine/scene/core/mesh_component";
import BoidMaterial from "./boids/rendering/boid_material";
import BoidTexture from "../assets/guy-3.png";
import CameraMovement from "./components/camera_movement";
import {  Color, Vector3 } from "@engine/math/src";
import { Unit } from "./units/unit";
import { UnitType } from "./squad/squad";
import { QuadNoCollider } from "@engine/prefabs/quad.prefab";
import CodeWritingMarker from "@assets/code-logo.png";
import BoidOutlineMaterial from "./boids/rendering/boid_outline_material";
export default class BoidScene extends Scene {

  public boidSystem!: BoidSystemComponent;
  protected gameManager!: GameObject;

  private _units : Unit[] = [];
  private _idMappedUnits = new Map<number, Unit>();

  public codeWritingTarget: GameObject;


  awake(engine: Engine): void {
    super.awake(engine);
    // this.reportFPS();
    
    this.gameManager = new GameObject("GAME_MANAGER", this);
    
    this.codeWritingTarget = QuadNoCollider(this, new Color(50/255, 168/255, 82/255), CodeWritingMarker);
    this.codeWritingTarget.transform.scale = new Vector3(0.5, 0.5, 1);
    console.log(this.codeWritingTarget.transform.position);
    this.codeWritingTarget.visible = false;

    // Add camera movement 
    this.activeCamera!.gameObject.addComponent(new CameraMovement());

    const boids = new GameObject("boids", this);

    const boidSystem = new BoidSystemComponent(this.grid);

    this.boidSystem = boidSystem;

    boids.addComponent(boidSystem);

    const material = new BoidMaterial(
      this,
      boidSystem.objectBuffer,
    );

    const outlineMaterial = new BoidOutlineMaterial(
      this,
      boidSystem.objectBuffer
    )

    const mesh = new QuadMesh(material);
    boids.addComponent(mesh);

    mesh.addMaterial(outlineMaterial);

    outlineMaterial.textureUrl = [BoidTexture, BoidTexture];
    material.textureUrl = [BoidTexture, BoidTexture];


    this.activeCamera!.gameObject.transform.position.z = -10;
  }

  public get units() : Unit[] {
    return this._units.filter((b) => b.alive);
  }

  public getUnit (index: number) : Unit {
    if (this._idMappedUnits.has(index)) {
      return this._idMappedUnits.get(index)!;
    }
    else {
      throw new Error(`Unit ${index} not found`);
    }
  }

  public createUnit (
    ownerId: number = 0,
    unitType: UnitType = "Soldier",
    position?: Vector3,
    avoidanceForce : number = 1.0,
    textureIndex: number = 0,
    scale : number = 0.3,
    speed : number = 1.0,
    clampToGrid = true
  ) : Unit | undefined {

    const rV3 = new Vector3(
      Math.random() * 0.2 - 0.1,
      Math.random() * 0.2 - 0.1,
      0
    );

    let p = position ?? this.input.mouseToWorld(0).clone();
    p = p.add(rV3).toVec3();
    p.z = 0;

    const spawnData = this.boidSystem.addBoid({
     position: p,
     speed: speed,
     steeringSpeed: 6.0,
     avoidanceForce: avoidanceForce,
     textureIndex: textureIndex,
     scale: scale,
     clampToGrid: clampToGrid,
     outlineColor: ownerId === 0 ? [0, 0, 0, 0] : [1, 0, 0, 1],
   });
   
   if (spawnData?.instance)  {
    const unit = new Unit(
      ownerId,
      unitType
    );


    spawnData.gameObject.addComponent(unit);


    this._units.push(unit);
    this._idMappedUnits.set(spawnData.id, unit);

    return unit;
   }

   return undefined;
  }

  render(dT: number): void {
    super.render(dT);

  }
}
