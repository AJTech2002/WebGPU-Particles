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
  const mouse = game.mousePosition;
  if (selection.length > 0) {
    for (let i = 0; i < selection.length; i++) {
      selection[i].moveToPos(mouse);
    }
  }
}

function moveTo (x: number, y: number) {
  if (selection.length > 0) {
    for (let i = 0; i < selection.length; i++) {
      selection[i].moveTo(x, y);
    }
  }
}

function followNearestEnemy() {
  if (selection.length > 0) {
    for (let i = 0; i < selection.length; i++) {
      const enemy = selection[i].getClosestEnemy();
      if (enemy) {
        selection[i].moveToPos(enemy.position);
      }
    }
  }
}

function attackNearest() {
  if (selection.length > 0) {
    for (let i = 0; i < selection.length; i++) {
      const enemy = selection[i].getClosestEnemy();
      if (enemy) {
        selection[i].attack(enemy);
      }
    }
  }
}

//#endregion