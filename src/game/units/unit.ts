import { Debug } from "@engine/debug/debug";
import { Vector3, Vector4 } from "@engine/math/src";
import Component from "@engine/scene/component";
import Collider from "@engine/scene/core/collider_component";
import BoidScene from "@game/boid_scene";
import BoidInstance from "@game/boids/boid_instance";
import BoidSystemComponent from "@game/boids/boid_system";
import { Castle } from "@game/components/castle";
import { Damageable } from "@game/components/damageable";
import { Rock } from "@game/components/enemies/rock";
import { UnitType } from "@game/squad/squad";
import { vec3 } from "gl-matrix";

export class Unit extends Damageable {
  private boidInstance!: BoidInstance;
  private system!: BoidSystemComponent;
  private _unitType: UnitType = "Soldier";
  private _ownerId: number = 0; // 0 is player / 1 is enemy

  constructor(ownerId: number, unitType: UnitType) {
    super(100, 0);
    this._ownerId = ownerId;
    this._unitType = unitType;
  }

  public awake(): void {
    this.boidInstance =
      this.gameObject.getComponent<BoidInstance>(BoidInstance)!;
    this.system = this.gameObject.scene.findObjectsOfType(
      BoidSystemComponent
    )[0] as BoidSystemComponent;
    // this.setUnitScale();
    this.setUnitColor();
  }

  public get id() {
    return this.boidInstance.id;
  }

  public get position(): Vector3 {
    return new Vector3(
      this.transform.position.x,
      this.transform.position.y,
      this.transform.position.z
    );
  }

  public get boid(): BoidInstance {
    return this.boidInstance;
  }

  public get ownerId(): number {
    return this._ownerId;
  }

  public get unitType(): UnitType {
    return this._unitType;
  }

  public moveTo (x: number, y: number) {
    this.boidInstance.moveTo(x, y);
  }

  private async deathAnimation() {
    let t = 0;
    const deathTime = 0.1;
    this.scene.runLoopForSeconds(
      deathTime,
      (dT) => {
        t += dT / deathTime / 1000;
        const scale = this.boidInstance.originalScale * (1 - t);
        this.boidInstance.scale = scale;
      },
      () => {
        this.boidInstance.diffuseColor = new Vector4(0, 0, 0, 0);
        this.boidInstance.scale = 0;

        // Tell the system that the boid is dead and free up the slot
        this.system.removeBoid(this.boidInstance.id);
      }
    );
  }

  private enemyColorPallete: vec3[] = [
    [150.0 / 255.0, 150.0 / 255.0, 150.0 / 255.0],
    [42.0 / 255.0, 39.0 / 255.0, 52.0 / 255.0],
  ];

  private playerColorPallete: vec3[] = [
    [243.0 / 255.0, 131.0 / 255.0, 85.0 / 255.0],
    [255.0 / 255.0, 171.0 / 255.0, 105.0 / 255.0],
  ];

  async setUnitColor() {
    let boidColor =
      this.playerColorPallete[
        Math.floor(Math.random() * this.playerColorPallete.length)
      ];
    if (this._ownerId === 1) {
      boidColor =
        this.enemyColorPallete[
          Math.floor(Math.random() * this.enemyColorPallete.length)
        ];
    }

    this.boid.diffuseColor = new Vector4(
      boidColor[0],
      boidColor[1],
      boidColor[2],
      1.0
    );
    this.boid.originalColor = new Vector4(
      boidColor[0],
      boidColor[1],
      boidColor[2],
      1.0
    );
  }

  private maxScale = 0.32;
  private minScale = 0.3;

  async setUnitScale () {
    const expected = this.minScale + Math.random() * (this.maxScale - this.minScale);

    this.boid.originalScale = expected;

    // lerp up
    let t = 0;
    const lerpTime = 0.1;
    this.scene.runLoopForSeconds(
      lerpTime,
      (dT) => {
        t += dT / lerpTime / 1000;
        const scale = expected * t;
        this.boid.scale = scale;
      },
      () => {
        this.boid.scale = expected;
      }
    );
  }

  protected override handleDamage(amount: number): void {
    super.handleDamage(amount);
  }

  private alreadyColliding: boolean = false;
  override on_collision(collider: Collider): void {

    if (this.ownerId === 0) {
      if (collider.gameObject.name.includes("rock") && !this.alreadyColliding) {
        const rockComponent = collider.gameObject.getComponent<Rock>(Rock);
        rockComponent?.takeDamage(5);
        const force = this.position.clone().sub(collider.gameObject.transform.position).normalize().multiplyScalar(30.0);
        force.z = 0;
        this.knockbackForce(force, 0.05);
        this.takeDamage(500, true);
        
      }
    }

  }

  protected handleDeath(): void {
    this.boidInstance.setAlive(false);
    this.deathAnimation();
  }

  private lastAttackTime: number = 0;

  private knockingBack: boolean = false;

  public get friendlyNeighbours() {
    return this.system.getFriendlyNeighbours(this.boidInstance.id);
  }

  public get enemyNeighbours() {
    return this.system.getEnemyNeighbours(this.boidInstance.id);
  }

  async knockbackForce(force: Vector3, duration?: number) {
    if (!this.alive || this.knockingBack) return;
    this.knockingBack = true;
    this.boidInstance.externalForce = new Vector3(force.x, force.y, force.z);
    this.boidInstance.diffuseColor = new Vector4(1, 1, 1, 1);
    this.boidInstance.scale = this.boidInstance.originalScale * 1.2;

    if (duration) await this.scene.seconds(duration);
    else await this.scene.seconds(Math.random() * 0.1 + 0.05);

    if (!this.alive) {
      this.knockingBack = false;
      return;
    }

    this.boidInstance.diffuseColor = this.boidInstance.originalColor;
    this.boidInstance.externalForce = new Vector3(0, 0, 0);
    this.boidInstance.scale = this.boidInstance.originalScale;
    await this.scene.seconds(0.5);
    this.knockingBack = false;
  }

  public attackPosition(x: number, y: number) {
    // get dir
    const dir = new Vector3(x, y, 0).sub( this.position.clone() ); 
    dir.normalize();
    this.attack(dir.x, dir.y);
  }

  public attack(x: number, y: number) {
    if (!this.alive) return;

    const attackDistance = 0.4;

    const now = Date.now();
    if (now - this.lastAttackTime < 400) return;
    this.lastAttackTime = now;
    const neighbours = this.system.getBoidNeighbours(this.boidInstance.id);

    for (let i = 0; i < neighbours.length; i++) {
      if (neighbours[i].id === this.boidInstance.id ||
        neighbours[i].ownerId === this._ownerId
      ) continue;

      const unit = (this.scene as BoidScene).getUnit(neighbours[i].id);

      if (unit && unit.boid) {
        const boid = unit.boid;
        const boidPosition = new Vector3(
          boid.transform.position.x,
          boid.transform.position.y,
          boid.transform.position.z
        );

        if (!unit || !unit.alive) continue;

        // check distance
        const distance = this.position.distanceTo(boidPosition);
        if (distance < attackDistance) {
          // get dot product of (x,y) and (boid[i].position - boid[boidId].position)
          const dir = new Vector3(x, y, 0);
          dir.normalize();

          const boidDir = new Vector3();
          const thisPosition = new Vector3(
            this.position.x,
            this.position.y,
            this.position.z
          );
          boidDir.subVectors(boidPosition.clone(), thisPosition);
          boidDir.normalize();

          const dot = dir.dot(boidDir);
          // check if roughly parallel and in the same direction
          if (dot > 0.6) {
            // set external force away from the boid
            const force = new Vector3();
            force.copy(boidDir).multiplyScalar(0.2);
            
            if (unit.canTakeDamage())  {
              unit.knockbackForce(force);
              unit.takeDamage(10);
            }
          }
        }
      }
    }
  }
}
