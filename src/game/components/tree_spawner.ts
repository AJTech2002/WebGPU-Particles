import { Color, Vector3 } from "@engine/math/src";
import { StandardDiffuseMaterial } from "@engine/renderer/material";
import Component from "@engine/scene/component";
import Collider, { ColliderShape } from "@engine/scene/core/collider_component";
import Mesh, { QuadMesh } from "@engine/scene/core/mesh_component";
import GameObject from "@engine/scene/gameobject";
import TreeTexture from "../../assets/tree.png";
import { GridComponent } from "@game/grid/grid";
import { Quad, QuadWithMaterial } from "@engine/prefabs/quad.prefab";
import BoidSystemComponent from "@game/boids/boid_system";
import { Rigidbody } from "@engine/physics/rigidbody";
import OutlineMaterial from "@game/boids/rendering/outline_material";

export class TreeSpawner extends Component {

    private treeCount: number = 4;
    private grid! : GridComponent;
    private treeMaterial!: StandardDiffuseMaterial;
  
    public trees: GameObject[] = [];

    constructor() {
      super();
      this.treeMaterial = new StandardDiffuseMaterial(this.scene, TreeTexture);
    }

    public awake(): void {
      this.grid = this.scene.findObjectOfType<GridComponent>(GridComponent)!;
      for (let i = 0; i < this.treeCount; i++) {
        this.createTree();
      }
    }

    public start(): void {
      // Add trees to the boid system
      const boidSystem = this.scene.findObjectOfType<BoidSystemComponent>(BoidSystemComponent)!;
      this.trees.forEach(tree => {
        boidSystem.addCollider(tree.getComponent<Collider>(Collider)!);
      });
    }

    private createTree() {
      const squareCollider = QuadWithMaterial(this.scene, this.treeMaterial);
     
      let maxAttempts = 100;
      for (let i = 0; i < maxAttempts; i++) {

        // check other trees
        // randomize position
        const x = Math.random() * this.grid.size.x;
        const y = Math.random() * this.grid.size.y;
        const position = new Vector3(x - this.grid.size.x / 2, y - this.grid.size.y / 2, -9);
        squareCollider.transform.position = position;

        position.x = Math.round(position.x);
        position.y = Math.round(position.y);

        
        if (this.grid.canPlaceAtGridCell(squareCollider)) {
          squareCollider.transform.scale = new Vector3(0.5, 0.8, 1.0).multiplyScalar(0.8);
          squareCollider.getComponent(Collider)!.isStatic = true;
          squareCollider.addComponent(new Rigidbody());
          this.trees.push(squareCollider);
          this.grid.placeAtGridCell (squareCollider);
          maxAttempts = -1;
          break;
        }
  
      }

      if (maxAttempts !== -1) {
        console.warn("Could not place tree");
        squareCollider.destroy();
      }


    }
}