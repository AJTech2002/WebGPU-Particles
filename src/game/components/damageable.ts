import Component from "@engine/scene/component";
import { EventfulComponent } from "@engine/scene/core/eventful_component";
import EventEmitter from "events";

// Dmaage Events
type DamageEvents = {
  damage: number;
  death: void;
};


export class Damageable extends EventfulComponent<DamageEvents> {
  private _health: number = 100;
  private _damageTimeout: number = 0;

  constructor(health: number, damageTimeout: number = 0.3) {
    super();
    this._health = health;
    this._damageTimeout = damageTimeout;
  }

  public get health(): number {
    return this._health;
  }

  public get alive(): boolean {
    return this._health > 0;
  }

  private _lastDamageTime: number = 0;

  public canTakeDamage(): boolean {
    return this.scene.sceneTimeSeconds - this._lastDamageTime > this._damageTimeout
  }

  public setCanTakeDamage(value: boolean) {
    if (value) {
      this._lastDamageTime = 0;
    } else {
      this._lastDamageTime = this.scene.sceneTimeSeconds;
    }
  }

  public takeDamage(amount: number, force: boolean = false) {
    if (this._health <= 0) {
      return;
    
    }

    if (this.scene.sceneTimeSeconds - this._lastDamageTime > this._damageTimeout || force) {

      this._health -= amount;
      this._lastDamageTime = this.scene.sceneTimeSeconds; 
      this.handleDamage(amount);

      if (this._health <= 0) {
        this.die();
      }
    }


  }

  public die() {
    this._health = 0;
    this.handleDeath();  
  }

  protected handleDamage(amount: number) {
    // 
    this.emit("damage", amount);
  }

  protected handleDeath() {
    //
    this.emit("death", undefined);
  }

  
}