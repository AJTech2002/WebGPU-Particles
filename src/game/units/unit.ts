import { Vector3, Vector4 } from "@engine/math/src";
import Component from "@engine/scene/component";
import BoidScene from "@game/boid_scene";
import BoidInstance from "@game/boids/boid_instance";
import BoidSystemComponent from "@game/boids/boid_system";
import { UnitType } from "@game/squad/squad";

export class Unit extends Component {
  private _health: number = 100;
  private boidInstance!: BoidInstance;
  private system!: BoidSystemComponent;

  private _unitType: UnitType = "Soldier";
  private _ownerId : number = 0; // 0 is player / 1 is enemy

  constructor(ownerId: number, unitType: UnitType) {
    super();
    this._ownerId = ownerId;
    this._unitType = unitType;
  }

  public awake(): void {
    this.boidInstance = this.gameObject.getComponent<BoidInstance>(BoidInstance)!;
    this.system = this.gameObject.scene.findObjectsOfType(BoidSystemComponent)[0] as BoidSystemComponent;
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


  public get health(): number {
    return this._health;
  }

  public get alive(): boolean {
    return this._health > 0;
  }

  public get ownerId(): number {
    return this._ownerId;
  }

  public get unitType(): UnitType {
    return this._unitType;
  }

  private async die() {
    let t = 0;
    const deathTime = 0.1;
    this.scene.runLoopForSeconds(deathTime, (dT) => {
      t += dT/deathTime/1000;
      const scale = this.boidInstance.originalScale * (1 - t);
      this.boidInstance.scale = scale;
    }, () => {
      this.boidInstance.diffuseColor = new Vector4(0, 0, 0, 0);
      this.boidInstance.scale = 0;
    });
  }


  public takeDamage(damage: number) {
    if (!this.alive) return;

    this._health -= damage;
    if (this._health <= 0) {
      this.boidInstance.setAlive(false);
      this.die();
    }
  }


  private lastAttackTime: number = 0;

  async knockbackForce (id: number, force: Vector3) {
    this.boidInstance.externalForce = new Vector3(force.x, force.y, force.z);
    this.boidInstance.diffuseColor = new Vector4(1, 1, 1, 1);
    this.boidInstance.scale = this.boidInstance.originalScale * 1.2;

    await this.scene.seconds(Math.random() * 0.1 + 0.05);

    this.boidInstance.diffuseColor = this.boidInstance.originalColor;
    this.boidInstance.externalForce = new Vector3(0, 0, 0);
    this.boidInstance.scale = this.boidInstance.originalScale;
  }

  public attack (x: number, y: number) {

    if (!this.alive) return;

    const now = Date.now();
    if (now - this.lastAttackTime < 400) return;

    this.lastAttackTime = now;

    // get the neighbours 
    const neighbours = this.system.getBoidNeighbours(this.boidInstance.id);
    const boids = this.system.boidIdsToBoids(neighbours) as BoidInstance[];

    for (let i = 0; i < boids.length; i++) {
      if (boids[i].id == this.boidInstance.id) continue;

      // check distance 
      const distance = this.position.distanceTo(new Vector3(boids[i].position.x, boids[i].position.y, boids[i].position.z));
      if (distance < 0.4) {
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

          const unit = (this.scene as BoidScene).getUnit(boids[i].id);
          
          unit.knockbackForce(boids[i].id, force);
          unit.takeDamage( 10 );
        
        }
      }

    }

  }

}
