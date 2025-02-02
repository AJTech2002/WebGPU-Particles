import { Color } from "@engine/math/src";
import { StandardDiffuseMaterial } from "@engine/renderer/material";
import Scene from "@engine/scene";
import Collider, { ColliderShape } from "@engine/scene/core/collider_component";
import GameObject from "@engine/scene/gameobject";
import BossTexture from "../../assets/guy-3.png";
import { QuadMesh } from "@engine/scene/core/mesh_component";

export const Boss = (scene: Scene) : GameObject => {
  const boss = new GameObject("boss", scene);
  boss.addComponent(new Collider([0.7, 0.6, 0.6], ColliderShape.Circle, false, false));
  const bossMat = new StandardDiffuseMaterial(scene, BossTexture);
  bossMat.color = new Color(1.0, 0.25, 0.25);
  boss.transform.position.z = -9;
  boss.addComponent(new QuadMesh(bossMat));
  return boss;
}