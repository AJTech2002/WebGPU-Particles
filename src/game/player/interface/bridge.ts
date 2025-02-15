import BoidScene from "@game/boid_scene";
import BoidInstance from "@game/boids/boid_instance";
import { Unit } from "@game/units/unit";
import { BoidInterfaceCommand, BoidInterfaceData, EnemyInterfaceData } from "./bridge_commands";
import { Vector2, Vector3 } from "@engine/math/src";
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

  private getUnits () : Unit[] {
    return this.scene.units;
  }

  public getUnitsAtGrid (x: number, y: number) : BoidInstance[] {
    return this.scene.boidSystem.getBoidsInTile(x, y);
  }

  public worldToGrid (x: number, y: number) : { x: number, y: number } {
    return this.scene.grid.gridTileAt([x,y,0]);
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
      neighbours: boid.getNeighbourIds(),
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

  public sendGlobalCommand (command : BoidInterfaceCommand) {
    
  }

  public sendCommand (command : BoidInterfaceCommand) {
    if ('id' in command && command.id !== undefined) {
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
    else {
      if (command.type === "Create") {
        this.scene.createUnit(0, command.props.type, command.props.position);
      }
    }
  }

  public get mousePosition () : Vector3 {
    return this.scene.inputSystem.mouseToWorld(0, true);
  }

  // TODO: Will need to handle these across threads - best to write annotation @return(ETC) to quickly
  // cross call and return functions from threads
  public screenToWorld (x: number, y: number, z: number = 0, absolute : boolean = true) : Vector3 {
    return this.scene.inputSystem.screenToWorld(x, y, z, absolute);
  }

  public worldToScreen (pos: Vector3) : Vector2 {
    return this.scene.inputSystem.worldToScreen(pos, true);
  }

  private interfaces: Map<number, BoidInterface> = new Map();

  public getOrCreateInterface (id: number) : BoidInterface {
    if (this.interfaces.has(id)) {
      return this.interfaces.get(id)!;
    }
    else {
      const boidInterface = new BoidInterface(id, this);
      this.interfaces.set(id, boidInterface);
      return boidInterface;
    }
  }

  public getOrCreateInterfaces (instances: BoidInstance[]) : BoidInterface[] {
    return instances.map((instance) => this.getOrCreateInterface(instance.id));
  }

  public get boidInterfaces () : BoidInterface[] {
    return this.getUnits().map((unit) =>  this.getOrCreateInterface(unit.id));
  }

  public getBoidInterface (id : number) : BoidInterface {
    return this.getOrCreateInterface(id);
  }

}  