import Engine from "@engine/engine";
import CircleTexture from "../assets/circle.png";
import Scene from "@engine/scene";
import GameObject from "@engine/scene/gameobject";
import BoidSystemComponent from "./boids/boid_system";
import { QuadMesh } from "@engine/scene/core/mesh_component";
import BoidMaterial from "./boids/rendering/boid_material";
import BoidTexture from "../assets/guy-3.png";
import CameraMovement from "./components/camera_movement";
import Collider, { ColliderShape } from "@engine/scene/core/collider_component";
import { StandardDiffuseMaterial } from "@engine/renderer/material";
import { Color, Vector3 } from "@engine/math/src";
import SquareTexture from "../assets/tree.png";
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

  createCollider() {
    const collider = new GameObject("collider", this);
    collider.addComponent(new Collider([0.6, 0.6, 0.6], ColliderShape.Circle, false, false));

    const mat = new StandardDiffuseMaterial(this, CircleTexture); 
    
    collider.addComponent(new QuadMesh(
      mat
    ))
    mat.color = new Color(1,1,1);

    collider.transform.position.z = -9;
  }

  async spinSquare() {
    while (true) {
      await this.tick();
      const sin = Math.cos(this.time * 0.001) * 2;
      this.findGameObject("collider")!.transform.position.x = Math.sin(this.time * 0.003) * 5;; 
      // this.findGameObject("collider")!.transform.scale = new Vector3(0.75 + sin, 0.75 + sin, 0.75 + sin);

      const v3Pos = new Vector3(-2, sin, -9);
      // this.findGameObject("squareCollider")!.transform.rotation.z += 0.03; 
      // this.findGameObject("squareCollider")!.transform.scale.x = 1.75 + Math.abs(sin);
      // this.findGameObject("squareCollider")!.transform.position = v3Pos;
    }
  }

  awake(engine: Engine): void {
    super.awake(engine);
    this.reportFPS();

    // this.createCollider();
    this.spinSquare();

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

    boids.addComponent(new QuadMesh(new BoidMaterial(
      this,
      boidSystem.objectBuffer,
      BoidTexture
    )));

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
    position?: Vector3
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
     steeringSpeed: 6.0
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
