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
export class TestBoss extends Component {

  private rocks: GameObject[] = [];
  private rockMaterial = new StandardDiffuseMaterial(this.scene, RockTexture);
  private boidSystem!: BoidSystemComponent;
  private movementSpeed = 5.0;

  public awake(): void {
    this.boidSystem = this.scene.findObjectOfType<BoidSystemComponent>(BoidSystemComponent)!;
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

  public moveTo (position: Vector3) {
    const dir = position.clone().sub(this.gameObject.transform.position).normalize();
    dir.z = 0;
    this.gameObject.transform.position.add(dir.multiplyScalar(this.movementSpeed * this.scene.dT / 1000));
  }

  async throwRock(dir: Vector2) {
    bobScaleAnimation(this.gameObject.transform, new Vector3(1.0, 1.0, 1.0), new Vector3(1.2, 1.2, 1.0), 0.1);
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

  start() {
    this.rockMaterial.color = new Color(0.45, 0.4, 0.4);
    this.throwRocks();
  }

}