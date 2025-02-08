/* eslint-disable @typescript-eslint/no-explicit-any */
import { bgColor, fgColor } from "@/style";
import CodeMirror, {
  EditorState,
  KeyBinding,
  keymap,
  ReactCodeMirrorRef,
} from "@uiw/react-codemirror";

import * as duotone from "@uiw/codemirror-theme-duotone";

import { autocompletion } from "@codemirror/autocomplete";
import { typescriptCompletionSource } from "../../../tsUtils";
import { javascript } from "@codemirror/lang-javascript";
import { useContext, useState } from "react";

import "./CodeEditor.css";
import { CardCodingContext } from "@/App";
import { SquadDef } from "@game/squad/squad";
import readOnlyRangesExtension from "codemirror-readonly-ranges";

export interface CodeEditorProps {
  editor: React.RefObject<ReactCodeMirrorRef>;
  editorOpen: boolean;
  onUnFocus: () => void;
}

export function CodeEditor(props: CodeEditorProps) {
  const preCode = `import { vec3, vec4 } from "gl-matrix";
import { BoidInterface } from "/gameTypes/game/boids/interfaces/boid_interface.d.ts";
import {GameContext} from "/gameTypes/game/player/interface/interface.d.ts";
import {Squad} from "/gameTypes/game/squad/squad.d.ts";

// ==== Game Helpers ====
const tick : () => Promise<void>; // Call this to wait for one tick in the game
const seconds : (seconds: number) => Promise<void>; // Call this to wait for seconds
const until : (condition: () => boolean) => Promise<void>; // Call this to wait until a condition is met

// ==== Game Types ====
const game : GameContext; // The game context
const squad : Squad; // The squad you are controlling
const squadDropPosition : vec3; // Where you dropped the squad

// ==== Start Writing Code Here ===
`;

  const context = useContext(CardCodingContext);
  const [editingName, setEditingName] = useState<boolean>(false);

  const getReadOnlyRanges = (
    targetState: EditorState
  ): Array<{ from: number | undefined; to: number | undefined }> => {
    return [
      {
        from: undefined,
        to: targetState.doc.line(preCode.split("\n").length - 1).to,
      },
    ];
  };

  const save = () => {

    // const subcode = squad.code.substring(preCode.length, squad.code.length);
    // updateSquad(squad.id, { code: squad.code, preCode: preCode });
  };

  const customKeyMap: KeyBinding = {
    key: "Escape",
    win: "Escape",
    run: () => {
      save();
      props.onUnFocus();
      return true;
    },
  };

  return (
    <div
      onClick={() => {
        try {
          save();
        } catch (e) {
          console.error("Error saving code : ", e);
        }

        // props.onUnFocus();
      }}
      style={{
        pointerEvents: props.editorOpen ? "visible" : "none",
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        zIndex: 10,
        transitionDuration: "0.2s",
        opacity: props.editorOpen ? 1 : 0,
      }}
    >
      <div
        onClick={(e) => {
          e.stopPropagation();
        }}
        style={{
          height: "70vh",
          width: "80vw",
          display: "flex",
          flexDirection: "row",
          transitionDuration: "0.2s",
          borderRadius: "5px",
          borderColor: fgColor,
          borderWidth: "3px",
          borderStyle: "solid",
          boxShadow: "0px 0px 0px 0px rgba(0,0,0,0.8)",
          zIndex: 5,
          position: "relative",
          backgroundColor: bgColor,
          alignItems: "center",
          overflow: "hidden",
        }}
      >
        <CodeMirror
          ref={props.editor}
          // value={squad.code.trim() === "" ? preCode : squad.code}
          theme={duotone.duotoneDark}
          height="100%"
          width="100%"
          extensions={[
            readOnlyRangesExtension(getReadOnlyRanges),
            javascript({
              typescript: true,
            }),
            keymap.of([customKeyMap]),
            autocompletion({
              override: [typescriptCompletionSource as any],
              activateOnTyping: true,
              filterStrict: true,
              aboveCursor: true,
              maxRenderedOptions: 30,
            }),
          ]}
          onChange={(c) => {
            // ON CHANGE
          }}
        />
        <div
          style={{
            width: "1px",
            marginLeft: "10px",
            marginRight: "10px",
            marginTop: "10px",
            backgroundColor: fgColor,
            height: "100%",
          }}
        ></div>
        </div>
    </div>
  );
}
