import "./Terminal.css";
import { ReactCodeMirrorRef } from "@uiw/react-codemirror";
import React from "react";
export interface TerminalProps {
    editor: React.RefObject<ReactCodeMirrorRef>;
}
export declare function Terminal(props: TerminalProps): import("react/jsx-runtime").JSX.Element;
