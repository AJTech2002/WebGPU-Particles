import { Color, Vector3 } from "@engine/math/src";
import Material, { StandardDiffuseMaterial } from "@engine/renderer/material";
import Scene from "@engine/scene";
import Collider, { ColliderShape } from "@engine/scene/core/collider_component";
import { QuadMesh } from "@engine/scene/core/mesh_component";
import GameObject from "@engine/scene/gameobject";
import BoxTexture from "../../assets/empty-square.png";

export function Quad (scene: Scene, color? : Color, texture?: string, parent?: GameObject) : GameObject {
  const squareCollider = new GameObject("squareCollider", scene);
  squareCollider.addComponent(new Collider([1,1,1], ColliderShape.Square, false, false));
  const squareMat = new StandardDiffuseMaterial(scene, texture ?? BoxTexture);
  squareCollider.addComponent(new QuadMesh(squareMat));
  squareMat.color = color ?? new Color(1, 1, 1);
  squareCollider.transform.position.z = -9;

  if (parent) {
    squareCollider.parent = parent;
  }

  return squareCollider;
}

export function QuadWithMaterial (scene: Scene, material: Material, parent?: GameObject) : GameObject {
  const squareCollider = new GameObject("squareCollider", scene);
  squareCollider.addComponent(new Collider([1,1,1], ColliderShape.Square, false, false));
  squareCollider.addComponent(new QuadMesh(material));
  squareCollider.transform.position.z = -9;

  if (parent) {
    squareCollider.parent = parent;
  }

  return squareCollider;
}


export function QuadNoCollider (scene: Scene, color? : Color, texture?: string, parent?: GameObject) : GameObject {
  const squareCollider = new GameObject("square", scene);
  const squareMat = new StandardDiffuseMaterial(scene, texture ?? BoxTexture);
  squareCollider.addComponent(new QuadMesh(squareMat));
  squareMat.color = color ?? new Color(1, 1, 1);
  squareCollider.transform.position.z = -9;

  if (parent) {
    squareCollider.parent = parent;
  }

  return squareCollider;
}