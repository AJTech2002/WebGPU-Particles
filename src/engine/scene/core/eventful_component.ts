import Component from "../component";
import mitt, { EventType } from "mitt";

export class EventfulComponent<T extends Record<EventType, unknown>> extends Component {

  private emitter = mitt<T>();

    public on<K extends keyof T>(event: K, handler: (data: T[K]) => void) {
      this.emitter.on(event, handler);
    }

    public off<K extends keyof T>(event: K, handler: (data: T[K]) => void) {
      this.emitter.off(event, handler);
    }

    protected emit<K extends keyof T>(event: K, data: T[K]) {
      this.emitter.emit(event, data);
    }


}