import { bgColor, fgColor } from "@/style";
import CodeMirror, {
  EditorState,
  EditorView,
  KeyBinding,
  keymap,
  ReactCodeMirrorRef,
} from "@uiw/react-codemirror";

import * as duotone from "@uiw/codemirror-theme-duotone";

import { autocompletion } from "@codemirror/autocomplete";
import { saveFile, typescriptCompletionSource } from "../../../tsUtils";
import { javascript } from "@codemirror/lang-javascript";
import { useContext, useState } from "react";

import "./CodeEditor.css";
import { CardCodingContext } from "@/App";
import { SquadDef } from "@game/squad/squad";
import { useSquads } from "./SquadProvider";
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

const game : GameContext; // The game context
const squad : Squad; // The squad you are controlling
const squadDropPosition : vec3; // Where you dropped the squad

// ==== Start Writing Code Here ===
`;

  const context = useContext(CardCodingContext);

  const squadId = context.selectedCodeEditCard?.id ?? -1;
  const { updateSquad, updateSquadUnitType, squadState } = useSquads();

  const nullSquad = { id: -1, name: "", unitTypes: [], code: "", color: "" };

  const squad: SquadDef =
    squadId !== -1 ? squadState.get(squadId) ?? nullSquad : nullSquad;

  const [editingName, setEditingName] = useState<boolean>(false);

  const getReadOnlyRanges = (
    targetState: EditorState
  ): Array<{ from: number | undefined; to: number | undefined }> => {
    console.log("Getting read only ranges", preCode.split("\n").length + 1);
    return [
      {
        from: undefined,
        to: targetState.doc.line(preCode.split("\n").length - 1).to,
      },
    ];
  };

  const save = () => {

    // const subcode = squad.code.substring(preCode.length, squad.code.length);
    updateSquad(squad.id, { code: squad.code, preCode: preCode });
  };

  const customKeyMap: KeyBinding = {
    key: "Ctrl-Enter",
    win: "Control-Enter",
    run: (editor: EditorView) => {
      save();
      props.onUnFocus();
      return true;
    },
  };

  return (
    <div
      onClick={(e) => {
        try {
          save();
        } catch (e) {
          console.error("Error saving code : ", e);
        }

        props.onUnFocus();
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
          value={squad.code.trim() === "" ? preCode : squad.code}
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
            updateSquad(squad.id, { code: c });
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

        {/* INFO COLUMN */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "30%",
            height: "100%",
            backgroundColor: bgColor,
          }}
        >
          <div
            style={{
              width: "100%",
              textAlign: "center",
              textWrap: "nowrap",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                gap: "20px",
                fontSize: "1.2em",
              }}
            >
              {editingName === false ? (
                <p
                  onClick={(e) => {
                    setEditingName(true);
                    e.stopPropagation();
                    // give focus to the input wirth id
                    setTimeout(() => {
                      document.getElementById("squad-name-field")?.focus();
                    }, 100);
                  }}
                >
                  <b> {squad.name === "" ? "Squad Name" : squad.name} </b>
                </p>
              ) : (
                <input
                  id="squad-name-field"
                  type="text"
                  value={squad.name === "" ? "Squad Name" : squad.name}
                  onChange={(e) => {
                    updateSquad(squad.id, { name: e.target.value });
                  }}
                  onBlur={() => {
                    setEditingName(false);
                  }}
                  onKeyDown={(e) => {
                    // enter
                    if (e.key === "Enter") {
                      setEditingName(false);
                    }
                  }}
                />
              )}
              <input
                type="color"
                value={squad.color === "" ? "#000000" : squad.color}
                onChange={(e) => {
                  updateSquad(squad.id, { color: e.target.value });
                }}
              />
            </div>
            Props
            {/* Color Input */}
            <ul>
              {squad.unitTypes.map((unitType) => {
                return (
                  <div
                    key={unitType.type.toString() + "_DIV"}
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "center",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <li key={unitType.type.toString() + "_LI"}>
                      {unitType.type.toString()}
                    </li>
                    <input
                      style={{
                        width: "50px",
                      }}
                      key={+"_INP"}
                      type="number"
                      value={unitType.count}
                      onChange={(e) => {
                        updateSquadUnitType(
                          squad.id,
                          unitType.type,
                          Number.parseFloat(e.target.value)
                        );
                      }}
                    />
                  </div>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
