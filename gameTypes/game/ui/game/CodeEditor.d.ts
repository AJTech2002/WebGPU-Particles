import { ReactCodeMirrorRef } from "@uiw/react-codemirror";
import "./CodeEditor.css";
export interface CodeEditorProps {
    editor: React.RefObject<ReactCodeMirrorRef>;
    editorOpen: boolean;
    onUnFocus: () => void;
}
export declare function CodeEditor(props: CodeEditorProps): import("react/jsx-runtime").JSX.Element;
