import { Color, Vector3 } from "@engine/math/src";
import { Quad } from "@engine/prefabs/quad.prefab";
import Collider from "@engine/scene/core/collider_component";
import { Castle } from "@game/components/castle";
import CastleTexture from "@assets/castle.png";
import Scene from "@engine/scene";

export const CastlePrefab = (scene: Scene) => {
    const castle = Quad(scene, new Color(1, 1, 1), CastleTexture);
    castle.name = "Castle";
    castle.transform.scale = new Vector3(1.0, 1.2, 1.0);
    castle.getComponent<Collider>(Collider)!.size = [1.2, 1.2, 1.2];
    castle.addComponent(new Castle());

    return castle;
}