import Scene from "@engine/scene";
import { Rigidbody } from "./rigidbody";
import { GridComponent } from "@game/grid/grid";
import { Color, Vector3 } from "@engine/math/src";
import { Debug } from "@engine/debug/debug";
import { Vector2 } from "@engine/math/src";

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

  private rayDoesIntersect(
    _origin: Vector3,
    _direction: Vector3,
    other: Rigidbody
  ): { intersectionPoint: Vector2 | null } {
    if (!other.collider) {
      return { intersectionPoint: null };
    }

    const origin = new Vector2(_origin.x, _origin.y);
    const direction = new Vector2(_direction.x, _direction.y);
  
    const collider = other.collider;
    const circleOrigin = other.transform.position;
    const circleRadius = collider.worldExtents.x / 2;
  
    // Compute vector from ray origin to circle center
    const oc = origin.clone().sub(circleOrigin.clone());
  
    // Quadratic equation coefficients (ray equation with circle equation)
    const a = direction.dot(direction);
    const b = 2 * oc.dot(direction);
    const c = oc.dot(oc) - circleRadius * circleRadius;
  
    // Compute the discriminant
    const discriminant = b * b - 4 * a * c;
  
    if (discriminant < 0) {
      return { intersectionPoint: null }; // No intersection
    }
  
    // Compute the nearest intersection point (t values from quadratic formula)
    const sqrtDiscriminant = Math.sqrt(discriminant);
    const t1 = (-b - sqrtDiscriminant) / (2 * a);
    const t2 = (-b + sqrtDiscriminant) / (2 * a);
  
    // Choose the nearest positive intersection
    let t = t1;
    if (t < 0) {
      t = t2;
    }
    if (t < 0) {
      return { intersectionPoint: null }; // Both intersections are behind the ray
    }
  
    // Compute intersection point
    const intersectionPoint = origin.add(direction.multiplyScalar(t));
  
    return { intersectionPoint };
  }

  //TODO: This is really bad, need to implement Bresemham's line algorithm
  public raycast2D(origin: Vector3, direction: Vector3, distance: number, debug: boolean = false): Rigidbody | null {

    const origin2D = new Vector2(origin.x, origin.y);
    const direction2D = new Vector2(direction.x, direction.y);

    // create a rounded radius based on the grid
    let radius = Math.ceil(distance / this.grid.cell_size) * this.grid.cell_size;
    radius = Math.max(this.grid.cell_size, radius);
    const midPoint : Vector3 = origin.clone().add(direction.clone().multiplyScalar(distance / 2));

   
    // find all tiles around
    const currentTile = this.grid.gridTileAt(midPoint.toVec3());
    const neighbours = this.grid.getNeighboursMulti(currentTile.x, currentTile.y, radius);
    const intersections : { rigidbody: Rigidbody, intersectionPoint: Vector2 }[] = [];
    for (let i = 0; i < neighbours.length; i++) {
      const hashed = this.grid.hashedTileIndex(neighbours[i].x, neighbours[i].y);
      if (this.hashMapped.has(hashed)) {
        const others = this.hashMapped.get(hashed)!;
        for (const other of others) {
          if (other.collider === null) {
            continue;
          }
          
          const result = this.rayDoesIntersect(origin, direction, other);
          if (result.intersectionPoint) {
            if (result.intersectionPoint.distanceTo(origin2D) < distance) {
              intersections.push({ rigidbody: other, intersectionPoint: result.intersectionPoint });
            }
          }
        }
      }
    }

    // sort by distance
    intersections.sort((a, b) => {
      return a.intersectionPoint.distanceTo(origin2D) - b.intersectionPoint.distanceTo(origin2D);
    });

    if (intersections.length > 0) {
      if (debug)
        Debug.line(origin.clone(), origin.clone().add(direction.clone().multiplyScalar(distance)), new Color(0, 1, 0), 2);
        
      return intersections[0].rigidbody;
    }

    if (debug)
      Debug.line(origin.clone(), origin.clone().add(direction.clone().multiplyScalar(distance)), new Color(1, 0, 0), 2);
      
    return null;

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

    const a = this.collisionMasks.get(layerA);
    if (a === undefined) {
      return true;
    }

    return (a & layerB) !== 0;
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