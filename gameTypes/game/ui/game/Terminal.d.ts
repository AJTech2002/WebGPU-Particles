import "./Terminal.css";
import { Emitter } from "mitt";
import { ReactCodeMirrorRef } from "@uiw/react-codemirror";
import React from "react";
export interface TerminalProps {
    editor: React.RefObject<ReactCodeMirrorRef>;
}
export type TerminalEvents = {
    open_new_terminal: void;
    close_active_terminal: void;
    submit_terminal: void;
    loop_toggle: void;
};
export declare const TerminalEventEmitter: Emitter<TerminalEvents>;
export declare function Terminal(props: TerminalProps): import("react/jsx-runtime").JSX.Element;
