import { EventType } from "mitt";
export declare class EventEmitter<T extends Record<EventType, any>> {
    emitter: import("mitt").Emitter<T>;
    on<K extends keyof T>(event: K, handler: (data: T[K]) => void): void;
    off<K extends keyof T>(event: K, handler: (data: T[K]) => void): void;
    emit<K extends keyof T>(event: K, data: T[K]): void;
}
