import { autocompletion } from "@codemirror/autocomplete";
import "./Terminal.css";
import { bgColor, fgColor } from "@/style";
import { javascript } from "@codemirror/lang-javascript";
import * as duotone from "@uiw/codemirror-theme-duotone";
import { saveFile, typescriptCompletionSource } from "../../../tsUtils";
import Player from "@game/player/session_manager";

import CodeMirror, {
  EditorState,
  KeyBinding,
  keymap,
  ReactCodeMirrorRef,
} from "@uiw/react-codemirror";
import React, { useEffect, useState } from "react";

export interface TerminalProps {
  editor: React.RefObject<ReactCodeMirrorRef>;
}

export function Terminal(props: TerminalProps) {
  const [terminalPosition, setTerminalPosition] = useState({ x: 0, y: 0 });
  const [terminalActive, setTerminalActive] = useState(false);
  const [terminalContent, setTerminalContent] = useState("");
  const [hasFocus, setHasFocus] = useState(false);
  const [terminalRunning, setTerminalRunning] = useState(false);

  let lastButtonPressed = Date.now();

  useEffect(() => {
    (window as any).lastMouseX = 0;
    (window as any).lastMouseY = 0;

  }, []);

  const tsComplete : any = (context : ReactCodeMirrorRef) => {

    const preCode = `
    import {GameContext} from "/gameTypes/game/player/interface/game_interface.d.ts";

    const game: GameContext;

    // ==== Game Helpers ====
    const tick : () => Promise<void>; // Call this to wait for one tick in the game
    const seconds : (seconds: number) => Promise<void>; // Call this to wait for seconds
    const until : (condition: () => boolean) => Promise<void>; // Call this to wait until a condition is met

    
    `.trim().toString();

    return typescriptCompletionSource(context, preCode + "\n");
  }

  useEffect(() => {

    const runCode = async () => {
      const code = terminalContent;
      console.log("Running code", code);
      if (code) {
        try {
          return new Promise<void>((resolve, reject) => {
            Player.runCode(code, (e) => {
              if (e) {
                reject(e);
              } else {
                resolve();
              }
            });
          });
        } catch (e) {
          console.error(e);
        }
      }
    }

    const openTerminal = () => {
      console.log("Opening terminal");
      // get mouse position
      setTerminalActive(true);
      setHasFocus(true);

      setTerminalPosition({
        x: (window as any).lastMouseX - 150,
        y: (window as any).lastMouseY + 30,
      });
      setTimeout(() => {
        setTerminalContent("");
        props.editor.current?.view?.focus();
      }, 10);
    };

    const closeTerminal = () => {
      setTerminalActive(false);
      setTerminalContent("");
    };

    const submitTerminal = (e: KeyboardEvent) => {
      console.log("Setting terminal ", !terminalActive);
      if (e.key === "Enter" && (e.ctrlKey || e.metaKey || e.shiftKey)) {
        
        if (!terminalActive) openTerminal();
        else {
          runCode().then(() => {
            closeTerminal();
          });
        }
        
      } else if (e.key === "/" && !terminalActive) {
        console.log("open terminal");
        openTerminal();
      }
    };

    window.addEventListener("keydown", submitTerminal);
    
    return () => {
      window.removeEventListener("keydown", submitTerminal);
    };
  }, [terminalActive, terminalPosition, props.editor, terminalContent]);

  const exitMap: KeyBinding = {
    key: "Escape",
    win: "Escape",
    run: () => {
      // save();
      // props.onUnFocus();
      // return true;
      setTerminalActive(false);
      return true;
    },
  };

  return (
    <div style={{
      opacity: terminalActive ? 1 : 0,
      transition: "opacity 0.2s",
    }}>
      <div
        id="terminal"

        style={{
          top: terminalPosition.y,
          left: terminalPosition.x,
          opacity: hasFocus ? 1 : 0.5,
        }}
      >
        <CodeMirror
          onMouseEnter={() => {
            setHasFocus(true);
          }}
          onMouseLeave={() => {
            setHasFocus(false);
          }}
          ref={props.editor}
          value={terminalContent}
          theme={duotone.duotoneDark}
          height={"100%"}
          width="100%"
          extensions={[
            javascript({
              typescript: true,
            }),

            autocompletion({
              override: [tsComplete],
              activateOnTyping: true,
              filterStrict: true,
              aboveCursor: true,
              maxRenderedOptions: 30,
            }),
            keymap.of([exitMap]),
          ]}
          onChange={(c) => {
            lastButtonPressed = Date.now();
            setTerminalContent(c);
          }}
        />
      </div>
    </div>
  );
}
