import { activeScene } from "@engine/engine";
import { Vector3 } from "@engine/math/src";
import TransformComponent from "@engine/scene/core/transform_component";

export const bobScaleAnimation = async (transform : TransformComponent, startScale : Vector3, endScale : Vector3, durationS : number) => {
  const _start : Vector3 = startScale.clone();
  const _end : Vector3 = endScale.clone();

  await new Promise<void>((resolve) => {
    let t = 0;
    transform.scene.runLoopForSeconds(durationS, (dT) => {
      t += dT/durationS/1000;
      transform.scale = _start.clone().lerp(_end, t);
    }, () => {
      resolve();
    });
  });

  await new Promise<void>((resolve) => {
    let t = 0;
    transform.scene.runLoopForSeconds(durationS, (dT) => {
      t += dT/durationS/1000;
      transform.scale = _end.clone().lerp(_start, t);
    }, () => {
      resolve();
    });
  });

  transform.scale = _start.clone();
}

export const bobAnimation = async (start : number, end : number, durationS : number, onChange : (v : number) => void) => {
  const _start : number = start;
  const _end : number = end;

  await new Promise<void>((resolve) => {
    let t = 0;
    activeScene?.runLoopForSeconds(durationS, (dT) => {
      t += dT/durationS/1000;
      const v = _start + (_end - _start) * t;
      onChange(v);
    }, () => {
      resolve();
    });
  });

  await new Promise<void>((resolve) => {
    let t = 0;
    activeScene?.runLoopForSeconds(durationS, (dT) => {
      t += dT/durationS/1000;
      const v = _end - (_end - _start) * t;
      onChange(v);
    }, () => {
      resolve();
    });
  });

  const v = _start;
}


