import Scene from "@engine/scene";
import { Rigidbody } from "./rigidbody";
import { GridComponent } from "@game/grid/grid";

export class Physics {

  private rigidbodies: Rigidbody[] = [];
  private scene: Scene;
  private grid: GridComponent;
  private collisionMasks = new Map<number, number>();

  constructor(scene: Scene, grid: GridComponent) {
    this.scene = scene;
    this.grid = grid;
  }

  public addRigidbody(rigidbody: Rigidbody) {
    this.rigidbodies.push(rigidbody);
  }

  public addCollisionMask(layerA: number, layerB: number, canCollide: boolean) {
    if (!this.collisionMasks.has(layerA)) {
      this.collisionMasks.set(layerA, 0);
    }

    if (canCollide) {
      this.collisionMasks.set(layerA, this.collisionMasks.get(layerA)! | layerB);
    } else {
      this.collisionMasks.set(layerA, this.collisionMasks.get(layerA)! & ~layerB);  
    }

  }

  public removeRigidbody(rigidbody: Rigidbody) {
    const index = this.rigidbodies.indexOf(rigidbody);
    if (index > -1) {
      this.rigidbodies.splice(index, 1);
    }
  }

  private canCollide(layerA: number, layerB: number): boolean {

    if (layerA === layerB) {
      return false;
    }

    if (!this.collisionMasks.has(layerA)) {
      return true;
    }

    return (this.collisionMasks[layerA] & layerB) !== 0;
  }

  private resolveCollision (rigidbody: Rigidbody, other: Rigidbody) {
    if (rigidbody.collider === null || other.collider === null) {
      return;
    }

    const circleRadius = rigidbody.collider.worldExtents.x / 2;
    const otherCircleRadius = other.collider.worldExtents.x / 2;

    const aPos = rigidbody.transform.position;
    const bPos = other.transform.position;

    const a = aPos.x - bPos.x;
    const b = aPos.y - bPos.y;

    const distance = Math.sqrt(a * a + b * b);

    if (distance < circleRadius + otherCircleRadius) {
      const normal = rigidbody.transform.position.clone().sub(other.transform.position).normalize();
      normal.z = 0;
      
      if (!rigidbody.collider.isStatic) {
        if (!rigidbody.collider.isTrigger) {
          const pushOut = normal.clone().multiplyScalar(circleRadius + otherCircleRadius - distance);
          rigidbody.transform.position.add(pushOut);
        }

        rigidbody.gameObject.on_collision(other.collider);
      }
    }

  }

  private hashMapped = new Map<number, Set<Rigidbody>>();
  // Re-hash
  public onRigidbodyMoved(rigidbody: Rigidbody) {
    const currentTile = this.grid.gridTileAt(rigidbody.transform.position.toVec3());
    const hashed = this.grid.hashedTileIndex(currentTile.x, currentTile.y);
    
    if (rigidbody.hashedIndex !== hashed) {

      // remove from old hash
      if (rigidbody.hashedIndex !== -1 && this.hashMapped.has(rigidbody.hashedIndex)) {
        this.hashMapped.get(rigidbody.hashedIndex)!.delete(rigidbody);
      }

      rigidbody.hashedIndex = hashed;
    }

    if (this.hashMapped.has(hashed)) {
      this.hashMapped.get(hashed)!.add(rigidbody);
    } else {
      this.hashMapped.set(hashed, new Set([rigidbody]));
    }

  }

  public update(deltaTime: number) {
    for (let i = 0; i < this.rigidbodies.length; i++) {
      const rigidbody = this.rigidbodies[i];
      const currentTile = this.grid.gridTileAt(rigidbody.transform.position.toVec3());
      const neighbours = this.grid.getNeighbours(currentTile.x, currentTile.y);
      for (let j = 0; j < neighbours.length; j++) {
        const neighbour = neighbours[j];
        const hashed = this.grid.hashedTileIndex(neighbour.x, neighbour.y);
        if (this.hashMapped.has(hashed)) {
          const others = this.hashMapped.get(hashed)!;
          for (const other of others) {
            if (rigidbody !== other && this.canCollide(rigidbody.layer, other.layer)) {
              this.resolveCollision(rigidbody, other);
            }
          }
        }
      }
    }
  } 

}