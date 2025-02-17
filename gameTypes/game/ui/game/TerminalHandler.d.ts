export interface TerminalOpenArgs {
    mousePosition?: [number, number];
    fromSelection?: boolean;
}
export type TerminalEvents = {
    open_new_terminal: TerminalOpenArgs;
    close_active_terminal: void;
    submit_terminal: void;
    loop_toggle: void;
};
export declare const TerminalEventEmitter: import("mitt").Emitter<TerminalEvents>;
