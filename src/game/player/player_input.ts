import { InputMapping, key_mappings } from "./input_mappings";
import { SessionManager } from "./session_manager";

enum KeybindType {
  Press = 0,
  Hold = 1,
  Release = 2,
}

export default class PlayerInput {
  
  private session: SessionManager;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  private mappedKeys = new Map<string, Function>();

  private activeModifiers = new Set<string>();
  private activeKeys = new Set<string>();

  constructor (session: SessionManager) {
    this.session = session;

    for (const mapping of key_mappings) {
      this.add_key_mapping(mapping);
    }

    this.init();
  }

  private process_key (key: string) {
    return key.toLowerCase();
  }

  private current_mappings () : string[] {
    const mappings : string[] = [];

    const acKeys = Array.from(this.activeKeys);

    for (let i = 0; i < acKeys.length; i++) {
      const activeKey = acKeys[i];
      const key = this.process_key(activeKey);
      const modifiers = Array.from(this.activeModifiers).join("+");
      if (modifiers.length > 0) {
        mappings.push(`${modifiers}|${key}`);
      }
      else {
        mappings.push(key);
      }
    }

    return mappings;
  }

  private context : any = {};
  
  public add_key_mapping (mapping: InputMapping) {

    this.mappedKeys.set(mapping.key, fn);

  }

  private init () {
    // bind 
    this.onClick = this.onClick.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);
    this.onWheel = this.onWheel.bind(this);
    this.onKeyPress = this.onKeyPress.bind(this);

    // canvas.addEventListener("click", this.onClick);
    // canvas.addEventListener("mousemove", this.onMouseMove);
    document.addEventListener("keydown", this.onKeyDown);
    document.addEventListener("keyup", this.onKeyUp);
    // canvas.addEventListener("wheel", this.onWheel);
    document.addEventListener("keypress", this.onKeyPress);
  }

  private onClick (event: MouseEvent) {
    if (this.session.codeEditorHasFocus()) {
      return;
    }

    console.log("Click", event);
  }

  private onMouseMove (event: MouseEvent) {
    if (this.session.codeEditorHasFocus()) {
      return;
    }

    console.log("Mouse Move", event);
  }

  private processKeyMap (map: string, state: KeybindType) {
    if (state === KeybindType.Press) {}
    else if (state === KeybindType.Hold) {}
    else if (state === KeybindType.Release) {}
  }

  private processKeyMappings (mappings: string[], state: KeybindType) {
    for (let i = 0; i < mappings.length; i++) {
      this.processKeyMap(mappings[i], state);
    }
  } 

  private onKeyDown (event: KeyboardEvent) {
    if (this.session.codeEditorHasFocus()) {
      return;
    }

    const processed = this.process_key(event.key);

    if (this.activeModifiers.has(processed) || this.activeKeys.has(processed)) {
      return;
    }

    if (processed === "control" || processed === "shift" || processed === "alt") {
      this.activeModifiers.add(processed);
    }
    else {
      this.activeKeys.add(event.key);
    }

    this.processKeyMappings(this.current_mappings(), KeybindType.Press);
    
  }

  private onKeyUp (event: KeyboardEvent) {
    if (this.session.codeEditorHasFocus()) {
      return;
    }

    const processed = this.process_key(event.key);
    if (this.activeModifiers.has(processed) || this.activeKeys.has(processed)) {
      if (processed === "control" || processed === "shift" || processed === "alt") {
        this.activeModifiers.delete(processed);
      }
      else {
        this.activeKeys.delete(event.key);
      }
  
      this.processKeyMappings(this.current_mappings(), KeybindType.Press);
    }
    
    
  }

  private onKeyPress (event: KeyboardEvent) {
    if (this.session.codeEditorHasFocus()) {
      return;
    }

    // console.log(this.current_mappings());
  }


  private onWheel (event: WheelEvent) {
    if (this.session.codeEditorHasFocus()) {
      return;
    }
    
    console.log("Wheel", event);
  }

  

}
