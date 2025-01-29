import BoidScene from "@game/boid_scene";
import BoidInstance from "@game/boids/boid_instance";
import { Unit } from "@game/units/unit";
import { BoidInterfaceCommand, BoidInterfaceData, EnemyInterfaceData } from "./bridge_commands";
import { Vector3 } from "@engine/math/src";
import { BoidInterface } from "./boid_interface";

export class GameDataBridge {

  private scene : BoidScene;

  constructor (scene : BoidScene) {
    this.scene = scene;
  }

  /* THIS WILL BE REMOVED AND REPLACED WITH COMMANDS */
  private getBoid (id : number) : BoidInstance {
    return this.scene.getUnit(id).boid;
  }

  private getUnit (id : number) : Unit {
    return this.scene.getUnit(id);
  }

  private get units () : Unit[] {
    return this.scene.units;
  }
  /* ^^ THIS WILL BE REMOVED AND REPLACED WITH COMMANDS ^^ */

  public getBoidData (id : number) : BoidInterfaceData {
    const boid = this.getBoid(id);
    const unit = this.getUnit(id);
    return {
      id: boid.id,
      ownerId: unit.ownerId,
      position: boid.position,
      alive: boid.alive,
      neighbours: boid.getNeighbours().map((neighbour) => neighbour.id),
      unitType: unit.unitType
    }
  }

  public getEnemyData (id : number) : EnemyInterfaceData {
    const boid = this.getBoid(id);
    const unit = this.getUnit(id);
    return {
      id: boid.id,
      ownerId: unit.ownerId,
      position: boid.position,
      alive: boid.alive,
      unitType: unit.unitType,
      health: unit.health
    }
  }

  public async tick() : Promise<void> {
    return await this.scene.tick();
  }

  public async seconds(seconds: number) : Promise<void> {
    return await this.scene.seconds(seconds);
  }

  public async until (condition: () => boolean) : Promise<void> {
    return await this.scene.until(condition);
  }

  public sendCommand (command : BoidInterfaceCommand) {
    const boid = this.getBoid(command.id);
    const unit = this.getUnit(command.id);

    if (unit.ownerId !== 0) return; // Can only send commands to player units 

    //TODO: Move all this to `command_handler.ts` on the scene thread and do checks there
    if (command.type === "Move") {
      if (command.props.dir) {
        boid.move(command.props.vec.x, command.props.vec.y);
      }
      else {
        boid.moveTo(command.props.vec.x, command.props.vec.y);
      }
    }
    else if (command.type === "Attack") {
      unit.attack(command.props.direction.x, command.props.direction.y);
    }
    else if (command.type === "TakeDamage") {
      unit.takeDamage(command.props.damage);
    }
    else if (command.type === "Terminate") {
      unit.die();
    }
    else if (command.type === "Stop") {
      boid.stop();
    }
  }

  public get mousePosition () : Vector3 {
    return this.scene.inputSystem.mouseToWorld(0);
  }

  public get boidInterfaces () : BoidInterface[] {
    return this.units.map((unit) => new BoidInterface(unit.id, this));
  }

  public getBoidInterface (id : number) : BoidInterface {
    return new BoidInterface(id, this);
  }

}  