import { InputMapping } from "./input_mappings";
import { SessionManager } from "./session_manager";
export default class PlayerInput {
    private session;
    private mappedKeys;
    private activeModifiers;
    private activeKeys;
    constructor(session: SessionManager);
    private process_key;
    private current_mappings;
    add_key_mapping(mapping: InputMapping): void;
    private init;
    private onClick;
    private onMouseMove;
    private processKeyMap;
    private processKeyMappings;
    private onKeyDown;
    private onKeyUp;
    private onKeyPress;
    private onWheel;
}
