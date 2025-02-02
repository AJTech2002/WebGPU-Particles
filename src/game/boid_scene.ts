import Engine from "@engine/engine";
import CircleTexture from "../assets/circle.png";
import Scene from "@engine/scene";
import GameObject from "@engine/scene/gameobject";
import BoidSystemComponent from "./boids/boid_system";
import { QuadMesh } from "@engine/scene/core/mesh_component";
import BoidMaterial from "./boids/rendering/boid_material";
import BoidTexture from "../assets/guy-3.png";
import BossTexture from "../assets/boss.png";
import CameraMovement from "./components/camera_movement";
import Collider, { ColliderShape } from "@engine/scene/core/collider_component";
import { StandardDiffuseMaterial } from "@engine/renderer/material";
import { Color, Vector3 } from "@engine/math/src";
import { Unit } from "./units/unit";
import { UnitType } from "./squad/squad";
import { TreeSpawner } from "./components/tree_spawner";
import { Grid } from "../engine/prefabs/grid.prefab";
import { GridComponent } from "./grid/grid_go";

export default class BoidScene extends Scene {

  protected boidSystem!: BoidSystemComponent;
  protected grid!: GridComponent;
  protected gameManager!: GameObject;

  private _units : Unit[] = [];
  private _idMappedUnits = new Map<number, Unit>();


  awake(engine: Engine): void {
    super.awake(engine);
    this.reportFPS();
    this.grid = Grid(this, 50, 50).getComponent<GridComponent>(GridComponent)!;
    
    this.gameManager = new GameObject("GAME_MANAGER", this);
    this.gameManager.addComponent(
      new TreeSpawner()
    );

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

    boids.addComponent(new QuadMesh(material));

    material.textureUrl = [BoidTexture, BoidTexture];


    this.activeCamera!.gameObject.transform.position.z = -10;
  }

  public get units() : Unit[] {
    return this.units.filter((b) => b.alive);
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
    scale : number = 0.3
  ) : Unit | undefined {

    const rV3 = new Vector3(
      Math.random() * 0.2 - 0.1,
      Math.random() * 0.2 - 0.1,
      0
    );

    let p = position ?? this.input.mouseToWorld(0).clone();
    p = p.add(rV3).toVec3();

    const spawnData = this.boidSystem.addBoid({
     position: p,
     speed: 1.0,
     steeringSpeed: 6.0,
     avoidanceForce: avoidanceForce,
     textureIndex: textureIndex,
     scale: scale
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
