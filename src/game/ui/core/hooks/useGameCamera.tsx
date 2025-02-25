import { Vector3, Vector2 } from '@engine/math/src';
import { SessionManager } from '@game/player/session_manager';
import { useCallback, useEffect, useState } from 'react';

const v3 = new Vector3(0, 0, 0);
const v2 = new Vector2(0, 0);
export function useGameCamera(player: SessionManager) {

  const [trackingPosition, setTrackingPosition] = useState({ x: 0, y: 0, z: 0 });
  const [trackingScreenPosition, setTrackingScreenPosition] = useState({ x: 0, y: 0 });
  const [trackingScale, setTrackingScale] = useState(1);


  const run = useCallback(() => {
    v3.x = trackingPosition.x;
    v3.y = trackingPosition.y;
    v2.x = trackingScreenPosition.x;
    v2.y = trackingScreenPosition.y;

    if (player && player.scene && player.scene.activeCamera) {
      const screenPosition = player.scene.inputSystem.worldToScreen(v3, true);
      setTrackingScale(player.scene.activeCamera.scale);
      setTrackingScreenPosition({
        x: screenPosition.x,
        y: screenPosition.y,
      });
    }
  }, [player, trackingPosition, trackingScreenPosition]); // `trackingScreenPosition` is still in dependencies

  useEffect(() => {
    if (!player || !player.scene) return;

    player.scene.activeCamera.on('camera-change', run);


    return () => {
      player.scene.activeCamera.off('camera-change', run);
    }

  }, [player, player.scene]);

  return { trackingPosition, trackingScreenPosition, setTrackingPosition, trackingScale };
}
