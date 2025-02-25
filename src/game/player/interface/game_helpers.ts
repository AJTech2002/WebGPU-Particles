// @ts-nocheck

import { GameContext } from "@/game/player/interface/game_interface";
import { Vector3 } from "@/engine/math/src";
import {BoidInterface} from "@/game/player/interface/boid_interface";
import { GlobalStorage } from "@/game/player/session_manager";

const game: GameContext;
const globals: GlobalStorage;
const mousePosition: Vector3;
const selection: BoidInterface[];

const tick : () => Promise<void>; // Call this to wait for one tick in the game
const seconds : (seconds: number) => Promise<void>; // Call this to wait for seconds
const until : (condition: () => boolean) => Promise<void>; // Call this to wait until a condition is met


//#region HELPERS

function moveToMouse () {
  const selected = selection.length > 0 ? selection : game.units;
  const mouse = game.mousePosition;
  if (selected.length > 0) {
    for (let i = 0; i < selected.length; i++) {
      selected[i].moveToPos(mouse);
    }
  }
}

function moveTo (x: number, y: number) {

  const selected = selection.length > 0 ? selection : game.units;

  if (selected.length > 0) {
    for (let i = 0; i < selected.length; i++) {
      selected[i].moveTo(x, y);
    }
  }
}

function followNearestEnemy() {
  const selected = selection.length > 0 ? selection : game.units;

  if (selected.length > 0) {
    for (let i = 0; i < selected.length; i++) {
      const enemy = selected[i].getClosestEnemy();
      if (enemy) {
        selected[i].moveToPos(enemy.position);
      }
    }
  }
}

function attackNearest() {
  const selected = selection.length > 0 ? selection : game.units;

  if (selected.length > 0) {
    for (let i = 0; i < selected.length; i++) {
      const enemy = selected[i].getClosestEnemy();
      if (enemy) {
        selected[i].attack(enemy);
      }
    }
  }
}

//#endregion