import mitt, { EventType } from "mitt";

export class EventEmitter<T extends Record<EventType, any>> {
  emitter = mitt<T>();

  on<K extends keyof T>(event: K, handler: (data: T[K]) => void) {
    this.emitter.on(event, handler);
  }

  off<K extends keyof T>(event: K, handler: (data: T[K]) => void) {
    this.emitter.off(event, handler);
  }

  emit<K extends keyof T>(event: K, data: T[K]) {
    this.emitter.emit(event, data);
  }
}
