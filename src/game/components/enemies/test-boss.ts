import { Color, Vector2, Vector3 } from "@engine/math/src";
import { StandardDiffuseMaterial } from "@engine/renderer/material";
import Component from "@engine/scene/component";
import GameObject from "@engine/scene/gameobject";
import RockTexture from "@assets/rock.png";
import { QuadSimple, QuadWithMaterial } from "@engine/prefabs/quad.prefab";
import { Rock } from "./rock";
import Collider, { ColliderShape } from "@engine/scene/core/collider_component";
import { bobAnimation, bobScaleAnimation } from "@engine/animations/bob.animation";
import BoidSystemComponent from "@game/boids/boid_system";
import { Rigidbody } from "@engine/physics/rigidbody";
import { TestEnemySceneLayers } from "@game/test_enemy_scene";
import { GridComponent } from "@game/grid/grid";
import { Debug } from "@engine/debug/debug";
import { EnemySquad, Squad } from "@game/squad/squad";
import BoidScene from "@game/boid_scene";
import { Unit } from "@game/units/unit";
import { Damageable } from "../damageable";
import Mesh from "@engine/scene/core/mesh_component";


type BossCommands = "THROW_ROCK" | "SPAWN_DEFENSIVE";

class CircularDefenseSquad extends EnemySquad {

  private radius = 5;
  private center: Vector3 = new Vector3(0, 0, 0);
  private onDeath: () => void;
  private size: number;

  constructor(scene: BoidScene, center: Vector3, radius: number, size: number, onDeath: () => void) {
    super(scene);
    this.center = center;
    this.radius = radius;
    this.onDeath = onDeath ?? (() => {});
    this.size = size;
    this.spawn();
  }

  private async spawn() {
    for (let i = 0; i < this.size; i++) {
      this.spawnEnemy(this.center.clone(), "Soldier", 1);
      await this.scene.seconds(0.2);
    }
  }

  public STATE : "SURROUND" | "ATTACK" = "SURROUND";

  public async track (go: GameObject) {
    while (this.units.length > 0) {
      this.setCenter(go.transform.position);
      await this.scene.tick();
    }
    this.onDeath();
  }

  public setCenter(center: Vector3) {
    this.center = center;
    const size = this.units.length;
    const radius = this.radius;

    for (let i = 0; i < size; i++) {

      // check unit neighbours

      if (this.units[i].position.distanceTo2D(this.center) < this.radius + 1.0) {
      const neighbours = this.scene.boidSystem.getBoidNeighbours(this.units[i].id);
      if (neighbours.length > 0) {
        // find the closest enemy
        let closest : Unit | null = null;

        for (const neighbour of neighbours) {
          if (neighbour.ownerId === 0) {
            if (closest === null) {
              closest = this.scene.getUnit(neighbour.id);
              continue;
            }
            else {
              const currentDistance = this.center.distanceTo(closest.position);
              const newDistance = this.center.distanceTo(this.scene.getUnit(neighbour.id).position);
              if (newDistance < currentDistance) {
                closest = this.scene.getUnit(neighbour.id);
              }
            }
            break;
          }
        }

        if (closest !== null) {
          this.units[i].moveTo(closest.position.x, closest.position.y);
          this.units[i].attackPosition(closest.position.x, closest.position.y);
          continue;
        }
      }
    }


      const angle = i * 2 * Math.PI / size;
      const x = center.x + radius * Math.cos(angle);
      const y = center.y + radius * Math.sin(angle);
      const pos = new Vector3(x, y, 0);
      this.units[i].moveTo(pos.x, pos.y);
      
      if (!this.units[i].alive) {
        this.units.splice(i, 1);
      }

    }
  }
  
}

export class TestBoss extends Damageable {

  private rocks: GameObject[] = [];
  private rockMaterial = new StandardDiffuseMaterial(this.scene, RockTexture);
  private boidSystem!: BoidSystemComponent;
  private movementSpeed = 0.5;
  private originalScale = new Vector3(1.0, 1.0, 1.0);
  private grid!: GridComponent;
  private material! : StandardDiffuseMaterial;
  private ogColor = new Color(0.45, 0.4, 0.4);
  constructor() {
    super(1000, 0.2);
  }
  

  public override awake(): void {
    this.boidSystem = this.scene.findObjectOfType<BoidSystemComponent>(BoidSystemComponent)!;
    this.grid = this.scene.findObjectOfType<GridComponent>(GridComponent)!;
    this.originalScale = this.gameObject.transform.scale.clone();
  }
  
  override start() {
    this.rockMaterial.color = new Color(0.45, 0.4, 0.4);
    // this.throwRocks();
    this.wander();
    // this.stateMachine();
    this.material = this.gameObject.getComponent(Mesh)!.getMaterial<StandardDiffuseMaterial>(StandardDiffuseMaterial)!;
    this.ogColor = new Color(this.material.color.r, this.material.color.g, this.material.color.b);

  }

  private activeSquad: CircularDefenseSquad | null = null;
  private outterActiveSquad: CircularDefenseSquad | null = null;

  private async stateMachine() {
    while (true) {

      const tile = this.grid.gridTileAt(this.gameObject.transform.position.toVec3());
      if (tile) {
        const neighbours = this.grid.getNeighboursMulti(tile.x, tile.y, 2);
        const boids = this.boidSystem.getBoidsInTiles (neighbours, {
          ownerId: 0,
          range: 5
        });

        
        if (boids.length > 10 && this.activeSquad === null) {
          // create a circular defense squad
          const squad = new CircularDefenseSquad(this.scene as BoidScene, this.gameObject.transform.position, 1, 20, () => {
            this.activeSquad = null;
          });
          squad.track(this.gameObject);
          this.activeSquad = squad;
        }
        
        if (boids.length > 1) {
          this.throwRock(boids[0].position.clone().sub(this.gameObject.transform.position.clone()));
        }

        if (boids.length > 20 && this.outterActiveSquad === null) {
          // create a circular defense squad
          const squad = new CircularDefenseSquad(this.scene as BoidScene, this.gameObject.transform.position, 2, 40, () => {
            this.outterActiveSquad = null;
          });
          squad.track(this.gameObject);
          this.outterActiveSquad = squad;
        }

      }

      if (this.health > 300) {
        await this.scene.seconds(0.6);
      }
      else {
        await this.scene.seconds(0.2);
      }
    }
  }

  protected handleDamage(amount: number): void {
    // flash
    super.handleDamage(amount);
    this.damageAnim();
  }


  protected handleDeath(): void {
    this.boidSystem.removeCollider(this.gameObject.getComponent<Collider>(Collider)!);
    this.gameObject.destroy();
  }

  private async damageAnim() {
    this.material.color = new Color(1.0, 1.0, 1.0);
    bobScaleAnimation(this.gameObject.transform,this.originalScale, new Vector3(0.9, 0.9, 0.9), 0.12);
    await this.scene.seconds(0.1);
    
    this.material.color = this.ogColor;
  }

  private async wander() {
    while (true) {
      const x = Math.random() * 2 - 1;
      const y = Math.random() * 2 - 1;
      const pos = new Vector2(x * this.grid.size.x/2, y * this.grid.size.y / 2);
      await this.moveTo(new Vector3(pos.x, pos.y, 0));
    }
  }
  
  private spawnRock() : GameObject {
    const rock = QuadSimple(this.scene, this.rockMaterial);
    rock.addComponent(new Collider([0.3, 0.3, 0.3], ColliderShape.Circle, true, false));
    rock.name = "rock";
    rock.transform.position = this.gameObject.transform.position.clone();
    rock.transform.position.z = -3;
    
    rock.addComponent(new Rock());
    const rigidbody = new Rigidbody();
    rigidbody.setLayer(TestEnemySceneLayers.BOSS);
    rock.addComponent(rigidbody);
    
    this.rocks.push(rock);
    return rock;
  }

  private steering: Vector3 = new Vector3(0, 0, 0);

  public async moveTo (position: Vector3) {

    position.z = this.gameObject.transform.position.z;
    // Debug.line(this.gameObject.transform.position, position, new Color(1, 0, 0), 10);
    const maxDuration = Math.random() * 5 + 3;
    let time = 0;
    while (this.gameObject.transform.position.distanceTo(position) > 0.5 && time < maxDuration) {
      const dir = position.clone().sub(this.gameObject.transform.position.clone()).normalize();
      dir.z = 0;
      await this.scene.tick();
      time += this.scene.dT;
      this.steering = this.steering.lerp(dir, 2.0 * this.scene.dT);
      this.gameObject.transform.position.add(this.steering.clone().multiplyScalar(this.movementSpeed * this.scene.dT));
    }
  }

  async throwRock(dir: Vector2) {
    bobScaleAnimation(this.gameObject.transform,this.originalScale, new Vector3(1.0, 1.0, 1.0), 0.12);
    const rock = this.spawnRock();
    rock.getComponent<Rock>(Rock)!.direction = new Vector3(dir.x, dir.y, 0).normalize();
    rock.getComponent<Rock>(Rock)!.speed = 3.0;
    const collider = rock.getComponent<Collider>(Collider);
    await this.scene.tick();
    this.boidSystem.addCollider(collider!);
  }

  async throwRocks() {
    while (true) {
      this.throwRock(new Vector2(Math.random() * 2 - 1, Math.random() * 2 - 1));
      await this.scene.seconds(1);
    }
  }

}