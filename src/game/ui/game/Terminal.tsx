import { autocompletion } from "@codemirror/autocomplete";
import "./Terminal.css";
import { bgColor, fgColor } from "@/style";
import { javascript } from "@codemirror/lang-javascript";
import * as duotone from "@uiw/codemirror-theme-duotone";
import { saveFile, typescriptCompletionSource } from "../../../tsUtils";
import Player from "@game/player/session_manager";
import mitt from "mitt";
import { AnimatePresence } from "framer-motion";
import { motion } from "framer-motion";
import { Prec } from '@codemirror/state';

import CodeMirror, {
  EditorState,
  KeyBinding,
  keymap,
  ReactCodeMirrorRef,
} from "@uiw/react-codemirror";
import React, { useCallback, useEffect, useState } from "react";

export interface TerminalProps {
  editor: React.RefObject<ReactCodeMirrorRef>;
}

export type TerminalEvents = {
  open_new_terminal: void;
  close_active_terminal: void;
  submit_terminal: void;
};

export const TerminalEventEmitter = mitt();

const onMouseMove = (e: MouseEvent) => {
  if (e && e.clientX && e.clientY) {
    (window as any).lastMouseX = e.clientX;
    (window as any).lastMouseY = e.clientY;
  }
};

const onMouseDown = (e: MouseEvent) => {
  if (e && e.clientX && e.clientY && (e.ctrlKey || e.metaKey)) {
    (window as any).lastMouseX = e.clientX;
    (window as any).lastMouseY = e.clientY;

    if (e.button === 0) {
      TerminalEventEmitter.emit("open_new_terminal");
    }
  }
}


const submitTerminal = (e: KeyboardEvent) => {
  if (e.key === "Enter" && (e.ctrlKey || e.metaKey || e.shiftKey)) {
    TerminalEventEmitter.emit("submit_terminal");
  }
  else if (e.key === "/") {
    TerminalEventEmitter.emit("open_new_terminal");
  }
};

window.addEventListener("keydown", submitTerminal);
window.addEventListener("mousedown", onMouseDown);
window.addEventListener("mouseenter", onMouseMove);
window.addEventListener("mousemove", onMouseMove);

export function Terminal(props: TerminalProps) {
  const [terminalPosition, setTerminalPosition] = useState(() => {
    return {
      x: 0,
      y: 0,
    };
  });
  const [terminalActive, setTerminalActive] = useState(false);
  const [oldTerminalContent, setOldTerminalContent] = useState("");
  const [terminalContent, setTerminalContent] = useState("");
  const [hasFocus, setHasFocus] = useState(false);
  const [terminalRunning, setTerminalRunning] = useState(false);
  const [terminalHistory, setTerminalHistory] = useState<string[]>([]);
  const [hasModified, setHasModified] = useState(false);
  const [historyIndex, setHistoryIndex] = useState(0);

  const openTerminal = useCallback(() => {
    if (!terminalActive && (window as any).lastMouseX) {
      console.log("Opening terminal");
      setTerminalActive(true);
      setHasFocus(true);
      
      const mouseX = () => ((window as any).lastMouseX || 0);
      const mouseY = () => ((window as any).lastMouseY || 0);
      const finalMouseX = mouseX();
      const finalMouseY = mouseY();
      Player.openTerminal([finalMouseX, finalMouseY]);

      console.log("Mouse X", mouseX(), "Mouse Y", mouseY());
      setTerminalPosition(props => {
        return {
          x: finalMouseX,
          y: finalMouseY,
        };
      }
      );
      setTimeout(() => {
        setTerminalContent("");
        props.editor.current?.view?.focus();
      }, 110);
    }
  }, [terminalActive, props.editor]);

  

  
  const closeTerminal = useCallback(() => {
    console.log("Closing terminal");
    setTerminalActive(false);
    setTerminalContent("");
    Player.closeTerminal();
  }, [terminalActive, props.editor]);

  const setToLastCommand = useCallback(
    (up) => {
     
      // ENsure if going up, terminal content is empty or the content is not modified
      if (up && terminalContent && hasModified) {
        return false;
      }

      // Ensure if going down, content is not modified
      if (!up && hasModified) {
        return false;
      }


      setHistoryIndex((prevIndex) => {
        let newIndex;
        if (up) {
          newIndex = Math.max(prevIndex - 1, 0);
        } else {
          newIndex = prevIndex + 1;
          if (newIndex >= terminalHistory.length) {
            newIndex = terminalHistory.length;
            setTerminalContent("");
            setHasModified(false);
            props.editor.current?.view?.focus();
            return newIndex;
          }
        }
        setTerminalContent(terminalHistory[newIndex] || "");
        setHasModified(false);
        props.editor.current?.view?.focus();
        return newIndex;
      });
      return true;
    },
    [terminalHistory, hasModified, terminalContent]
  );

  const runCode = useCallback(async () => {
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
          }, {}, {
            mousePosition: [terminalPosition.x, terminalPosition.y],
          });
        });
      } catch (e) {
        console.error(e);
      }
    }
  }, [terminalContent]);

  const tsComplete: any = useCallback((context: ReactCodeMirrorRef) => {
    const preCode = `
    import {GameContext} from "/gameTypes/game/player/interface/game_interface.d.ts";

    const game: GameContext;

    // ==== Game Helpers ====
    const tick : () => Promise<void>; // Call this to wait for one tick in the game
    const seconds : (seconds: number) => Promise<void>; // Call this to wait for seconds
    const until : (condition: () => boolean) => Promise<void>; // Call this to wait until a condition is met

    
    `
      .trim()
      .toString();

    return typescriptCompletionSource(context, preCode + "\n" + oldTerminalContent + "\n");
  }, [oldTerminalContent]);

  useEffect(() => {

    const submit = () => {
      if (terminalActive && props.editor.current?.view?.hasFocus) {
        runCode().then(() => {
          
          
          setTerminalHistory(h => [...h, terminalContent]);
          setOldTerminalContent(c => c + terminalContent + "\n");
          setHistoryIndex(i => terminalHistory.length + 1);
          setTerminalContent("");
          closeTerminal();
          // NOT ERROR -> SAVE TO GLOBAL LIST FOR INTELLISENSE - FOR THIS CONTEXT
        });
      }
    }

    TerminalEventEmitter.on("open_new_terminal", openTerminal);
    TerminalEventEmitter.on("close_active_terminal", closeTerminal);
    TerminalEventEmitter.on("submit_terminal", submit);

    return () => {
      TerminalEventEmitter.off("open_new_terminal", openTerminal);
      TerminalEventEmitter.off("close_active_terminal", closeTerminal);
      TerminalEventEmitter.off("submit_terminal", submit);
    };
  }, [terminalActive, terminalContent, terminalHistory, runCode]);

  const exitMap: KeyBinding = {
    key: "Escape",
    win: "Escape",
    run: () => {
      if (terminalActive && props.editor.current?.view?.hasFocus) {
        closeTerminal ();
        return true;
      }
    },
  };

  const previousMap: KeyBinding = {
    key: "ArrowUp",
    win: "ArrowUp",
    run: () => {
      return setToLastCommand(true);
    },
  };

  const nextMap: KeyBinding = {
    key: "ArrowDown",
    win: "ArrowDown",
    run: () => {
      return setToLastCommand(false);
    },
  };

  return (
    <AnimatePresence>
      {terminalActive && (
        <motion.div
          key="terminal"
          transition={{ duration: 0.1 }}
          initial={{  translateY: 30 }}
          animate={{ opacity: hasFocus ? 1 : 0.5, translateY: 0 }}
          exit={{  translateY: 30 }}
          style={{
            width: "100vw",
            position: "absolute",
            backgroundColor: bgColor,
            zIndex: 1000,
          left: 0, bottom: 0,
            // opacity: hasFocus ? 1 : 0.5,
          }}
        >
        <CodeMirror
          onBlur={() => {
              if (terminalContent.trim() === "") {
                closeTerminal();
              }
            }
          }
          onMouseEnter={() => {
            setHasFocus(true);
          }}
          onMouseLeave={() => {
            setHasFocus(false);
          }}
          className="block-game-input"
          ref={props.editor}
          value={terminalContent}
          theme={duotone.duotoneDark}
          height={"100%"}
          width="100%"
          extensions={[
            Prec.highest(keymap.of([exitMap, previousMap, nextMap])),


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
          ]}
          onChange={(c) => {
            setHasModified(true);
            setTerminalContent(c);
          }}
        /> 
        </motion.div>
      )}
    </AnimatePresence>
  );
}
