import { Debug } from "@engine/debug/debug";
import { Vector3, Vector4 } from "@engine/math/src";
import Component from "@engine/scene/component";
import BoidScene from "@game/boid_scene";
import BoidInstance from "@game/boids/boid_instance";
import BoidSystemComponent from "@game/boids/boid_system";
import { Castle } from "@game/components/castle";
import { Damageable } from "@game/components/damageable";
import { UnitType } from "@game/squad/squad";
import { vec3 } from "gl-matrix";

export class Unit extends Damageable {
  private boidInstance!: BoidInstance;
  private system!: BoidSystemComponent;
  private castle!: Castle;

  private _unitType: UnitType = "Soldier";
  private _ownerId : number = 0; // 0 is player / 1 is enemy

  constructor(ownerId: number, unitType: UnitType) {
    super(100);
    this._ownerId = ownerId;
    this._unitType = unitType;
  }

  public awake(): void {
    this.boidInstance = this.gameObject.getComponent<BoidInstance>(BoidInstance)!;
    this.system = this.gameObject.scene.findObjectsOfType(BoidSystemComponent)[0] as BoidSystemComponent;
    this.castle = this.gameObject.scene.findObjectOfType(Castle) as Castle;
    this.setUnitColor();
  }

  public get id() {
    return this.boidInstance.id;
  }

  public get position () : Vector3 {
    return new Vector3(this.transform.position.x, this.transform.position.y, this.transform.position.z);
  }

  public get boid () : BoidInstance {
    return this.boidInstance;
  }

  public get ownerId(): number {
    return this._ownerId;
  }

  public get unitType(): UnitType {
    return this._unitType;
  }

  private async deathAnimation() {
    let t = 0;
    const deathTime = 0.1;
    this.scene.runLoopForSeconds(deathTime, (dT) => {
      t += dT/deathTime/1000;
      const scale = this.boidInstance.originalScale * (1 - t);
      this.boidInstance.scale = scale;
    }, () => {
      console.log("Unit died");
      this.boidInstance.diffuseColor = new Vector4(0, 0, 0, 0);
      this.boidInstance.scale = 0;

      // Tell the system that the boid is dead and free up the slot
      this.system.removeBoid(this.boidInstance.id);

    });
  }

  private enemyColorPallete: vec3[] = [
    [150.0/255.0, 150.0/255.0, 150.0/255.0],
    [42.0/255.0, 39.0/255.0, 52.0/255.0],
  ];

  private playerColorPallete: vec3[] = [
    [243.0/255.0, 131.0/255.0, 85.0/255.0],
    [255.0/255.0, 171.0/255.0, 105.0/255.0],
  ];


  async setUnitColor () {
    let boidColor = this.playerColorPallete[Math.floor(Math.random() * this.playerColorPallete.length)];
    if (this._ownerId === 1) {
      boidColor = this.enemyColorPallete[Math.floor(Math.random() * this.enemyColorPallete.length)];
    }

    this.boid.diffuseColor = new Vector4(boidColor[0], boidColor[1], boidColor[2], 1.0);
    this.boid.originalColor = new Vector4(boidColor[0], boidColor[1], boidColor[2], 1.0);
  }

  protected override handleDamage(amount: number): void {
    super.handleDamage(amount);
  }

  protected handleDeath(): void {
    this.boidInstance.setAlive(false);
    this.deathAnimation();
  }

  private lastAttackTime: number = 0;

  async knockbackForce (id: number, force: Vector3) {

    if (!this.alive) return;

    this.boidInstance.externalForce = new Vector3(force.x, force.y, force.z);
    this.boidInstance.diffuseColor = new Vector4(1, 1, 1, 1);
    this.boidInstance.scale = this.boidInstance.originalScale * 1.2;

    await this.scene.seconds(Math.random() * 0.1 + 0.05);

    if (!this.alive) return;

    this.boidInstance.diffuseColor = this.boidInstance.originalColor;
    this.boidInstance.externalForce = new Vector3(0, 0, 0);
    this.boidInstance.scale = this.boidInstance.originalScale;
  }

  public attack (x: number, y: number) {

    if (!this.alive || !this.castle) return;

    const attackDistance = 0.4;

    const now = Date.now();
    if (now - this.lastAttackTime < 400) return;

    //TODO: Optimize but for now check if the castle has been hit directly?
    const rayColliders = this.scene.raycast(
      new Vector3(this.position.x, this.position.y, this.position.z),
      new Vector3(x, y, 0).normalize(),
      attackDistance
    );

    if (rayColliders.length > 0) {
      if (rayColliders[0].gameObject.name === "Castle") {
        //
        this.castle.takeDamage(10);
      }
      return;
    }

    this.lastAttackTime = now;

    // get the neighbours 
    const neighbours = this.system.getBoidNeighbours(this.boidInstance.id);
    const boids = this.system.boidIdsToBoids(neighbours) as BoidInstance[];

    for (let i = 0; i < boids.length; i++) {
      const unit = (this.scene as BoidScene).getUnit(boids[i].id);

      if (boids[i].id === this.boidInstance.id
        || !boids[i].alive || unit.ownerId === this._ownerId
      ) continue;

      // check distance 
      const distance = this.position.distanceTo(new Vector3(boids[i].position.x, boids[i].position.y, boids[i].position.z));
      if (distance < attackDistance) {
        // get dot product of (x,y) and (boid[i].position - boid[boidId].position)
        const dir = new Vector3(x, y, 0);
        dir.normalize();

        const boidDir = new Vector3();
        const boidPosition = new Vector3(boids[i].position.x, boids[i].position.y, boids[i].position.z);
        const thisPosition = new Vector3(this.position.x, this.position.y, this.position.z);
        boidDir.subVectors(boidPosition, thisPosition);
        boidDir.normalize();

        const dot = dir.dot(boidDir);
        // check if roughly parallel and in the same direction
        if (dot > 0.6 ) {
          // set external force away from the boid
          const force = new Vector3();
          force.copy(boidDir).multiplyScalar(0.2);
          unit.knockbackForce(boids[i].id, force);
          unit.takeDamage( 10 );
        
        }
      }

    }

  }

}
