import { Color } from "../math/src";
import Material from "../renderer/material";
import Scene from "../scene";
import GameObject from "../scene/gameobject";
export declare function Quad(scene: Scene, color?: Color, texture?: string, parent?: GameObject): GameObject;
export declare function QuadWithMaterial(scene: Scene, material: Material, parent?: GameObject): GameObject;
export declare function QuadNoCollider(scene: Scene, color?: Color, texture?: string, parent?: GameObject): GameObject;
export declare function QuadSimple(scene: Scene, material: Material): GameObject;
