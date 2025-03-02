import { Vector3, Vector2 } from '@engine/math/src';
import { SessionManager } from '@game/player/session_manager';
import { useCallback, useEffect, useState } from 'react';

const v3 = new Vector3(0, 0, 0);
const v2 = new Vector2(0, 0);
export function useGameCamera(player: SessionManager) {

  const [cameraPosition, setCameraPosition] = useState({ x: 0, y: 0, z: 0 });

  const run = useCallback(() => {
    if (!player || !player.scene) return;

    const v = player.scene.activeCamera.transform.position;
    setCameraPosition({ x: v.x, y: v.y, z: v.z });

  }, [player]); // `trackingScreenPosition` is still in dependencies

  useEffect(() => {
    if (!player || !player.scene) return;

    player.scene.activeCamera.on('camera-change', run);


    return () => {
      player.scene.activeCamera.off('camera-change', run);
    }

  }, [player, player.scene]);

  const screenToWorld = useCallback((x: number, y: number) => {
    if (!player || !player.scene) return;
    player.scene.inputSystem.screenToWorld(x, y, 0, true);
    return { x: v3.x, y: v3.y };
  }, [cameraPosition]);

  const worldToScreen = useCallback((x: number, y: number, z: number) => {
    if (!player || !player.scene) return;
    v3.set(x, y, z);
    player.scene.inputSystem.worldToScreen(v3, true);
    return { x: v2.x, y: v2.y };
  }, [cameraPosition]);

  return { cameraPosition, screenToWorld, worldToScreen };
}
