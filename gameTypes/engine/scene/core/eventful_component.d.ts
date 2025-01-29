import Component from "../component";
import { EventType } from "mitt";
export declare class EventfulComponent<T extends Record<EventType, unknown>> extends Component {
    private emitter;
    on<K extends keyof T>(event: K, handler: (data: T[K]) => void): void;
    off<K extends keyof T>(event: K, handler: (data: T[K]) => void): void;
    protected emit<K extends keyof T>(event: K, data: T[K]): void;
}
