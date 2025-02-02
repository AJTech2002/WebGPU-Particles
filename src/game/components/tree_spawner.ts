import { Color, Vector3 } from "@engine/math/src";
import { StandardDiffuseMaterial } from "@engine/renderer/material";
import Component from "@engine/scene/component";
import Collider, { ColliderShape } from "@engine/scene/core/collider_component";
import { QuadMesh } from "@engine/scene/core/mesh_component";
import GameObject from "@engine/scene/gameobject";
import TreeTexture from "../../assets/tree.png";
import { GridComponent } from "@game/grid/grid_go";
import { Quad, QuadWithMaterial } from "@engine/prefabs/quad.prefab";
import BoidSystemComponent from "@game/boids/boid_system";

export class TreeSpawner extends Component {

    private treeCount: number = 60;
    private grid! : GridComponent;
    private treeMaterial!: StandardDiffuseMaterial;
  
    private trees: GameObject[] = [];

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
      this.trees.push(squareCollider);
      // randomize position
      const x = Math.random() * this.grid.size.x;
      const y = Math.random() * this.grid.size.y;
      const position = new Vector3(x - this.grid.size.x / 2, y - this.grid.size.y / 2, -9);
      squareCollider.transform.position = position;
      squareCollider.transform.scale = new Vector3(0.6, 1.0, 1.0).multiplyScalar(0.8);
    }
}