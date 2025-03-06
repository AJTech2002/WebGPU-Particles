import { autocompletion } from "@codemirror/autocomplete";
import "./Terminal.css";
import { bgColor, fgColor } from "@/style";
import { javascript } from "@codemirror/lang-javascript";
import * as duotone from "@uiw/codemirror-theme-duotone";
import { typescriptCompletionSource } from "../../../tsUtils";
import Player from "@game/player/session_manager";
import { AnimatePresence } from "framer-motion";
import { motion } from "framer-motion";
import { Prec } from "@codemirror/state";
import LoopTexture from "@/assets/loop.png";
import CodeMirror, {
  KeyBinding,
  keymap,
  ReactCodeMirrorRef,
} from "@uiw/react-codemirror";
import React, { useCallback, useEffect, useState } from "react";
import { TerminalEventEmitter, TerminalOpenArgs, TerminalOutputs } from "./TerminalHandler";
import GameHelpers from "@game/player/interface/game_helpers?raw";

export interface TerminalProps {
  editor: React.RefObject<ReactCodeMirrorRef>;
}
export function Terminal(props: TerminalProps) {
  const [terminalActive, setTerminalActive] = useState(false);
  const [oldTerminalContent, setOldTerminalContent] = useState("");
  const [hasFocus, setHasFocus] = useState(false);
  const [terminalRunning, setTerminalRunning] = useState(false);
  const [terminalHistory, setTerminalHistory] = useState<string[]>([]);
  const [terminalArgs, setTerminalArgs] = useState<TerminalOpenArgs | null>(null);
  const clearContent = useCallback(() => {
    return "";
  }, []);
  const [terminalContent, setTerminalContent] = useState("");
  const [hasModified, setHasModified] = useState(false);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [loop, setLoop] = useState(false);
  const [lastTypedTime, setLastTypedTime] = useState(0);

  const openTerminal = useCallback(
    (args: TerminalOpenArgs) => {
      setTerminalActive(true);
      setTerminalArgs(args);
      console.log("Terminal Opening terminal", args);
      props.editor.current?.view?.focus();
      setTimeout(() => {

        if (args.code) {
          setTerminalContent(args.code);
        }
        else {
          setTerminalContent(clearContent());
        }

        setTimeout(() => {
          setCursorToLast();
        }, 10);
      }, 100);
    },
    [props.editor]
  );

  const closeTerminal = useCallback(() => {
    setTerminalActive(false);
    setTerminalContent(clearContent());
  }, [props.editor]);

  useEffect(() => {
    if (hasFocus) {
      Player.openTerminal();
    }
    else {
      Player.closeTerminal();
    }
  }, [hasFocus])

  const setCursorToLast = useCallback(() => {
    props.editor.current?.view?.focus();
    props.editor.current?.view?.dispatch({
      selection: {
        anchor: props.editor.current?.view?.state.doc.length,
      },
    });
  }, [props.editor]);

  const setToLastCommand = useCallback(
    (up) => {
      const cursorPosition =
        props.editor.current?.view?.state.selection.main.head;

      // ENsure if going up, terminal content is empty or the content is not modified
      if (up && terminalContent && hasModified) {
        return false;
      }

      // Ensure if going down, content is not modified
      if (!up && hasModified && cursorPosition) {
        return false;
      }

      if (
        !up &&
        cursorPosition !== props.editor.current?.view?.state.doc.length
      ) {
        return false;
      }

      if (up && cursorPosition !== 0) {
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
            setTerminalContent(clearContent());
            setHasModified(false);
            props.editor.current?.view?.focus();
            return newIndex;
          }
        }
        setTerminalContent(terminalHistory[newIndex] || clearContent());
        setHasModified(false);
        setCursorToLast();
        return newIndex;
      });
      return true;
    },
    [
      terminalHistory,
      hasModified,
      terminalContent,
      props.editor.current?.view?.state.selection.main.head,
    ]
  );

  const toggleLoop = useCallback(() => {
    console.log("Toggling Loop");
    setLoop((l) => !l);
  }, []);

  const tsComplete: any = useCallback(
    (context: ReactCodeMirrorRef) => {
      let preCode = GameHelpers + "\n".trim().toString();
      preCode = preCode.replace(/@/g, "/gameTypes/");

      return typescriptCompletionSource(
        context,
        preCode + "\n" + Player.userCodeStorage.getPreCode() + "\n"
      );
    },
    [oldTerminalContent]
  );

  const focusTerminal = useCallback(() => {
    // if didnt have focus
    props.editor.current?.view?.focus();
    setTimeout(() => {
      setTerminalContent(clearContent());
      setCursorToLast();
    }, 10);
  }, [hasFocus]);

  const checkLastTyped = useCallback(() => {
    if (Date.now() - lastTypedTime > 300) {
      setHasFocus(false);
    }
  }, [lastTypedTime]);

  useEffect(() => {

    const submit = () => {
      if (props.editor.current?.view?.hasFocus) {

        if (terminalArgs.onSubmit) {
          console.log("Submitting Terminal");
          terminalArgs.onSubmit({
            code: terminalContent,
            loop: loop,
          });
        }

        setLoop(false);
        setTerminalHistory((h) => [...h, terminalContent]);
        setOldTerminalContent((c) => c + terminalContent + "\n");
        setHistoryIndex((i) => terminalHistory.length + 1);
        setTimeout(() => {
          setTerminalContent(clearContent());
          setCursorToLast();
        }, 0);
        // closeTerminal();
      }
    };

    const interval = setInterval(() => {
      checkLastTyped();
    }, 300);

    TerminalEventEmitter.on("open_new_terminal", openTerminal);
    TerminalEventEmitter.on("close_active_terminal", closeTerminal);
    TerminalEventEmitter.on("submit_terminal", submit);
    TerminalEventEmitter.on("loop_toggle", toggleLoop);
    TerminalEventEmitter.on("focus_terminal", focusTerminal);

    return () => {
      clearInterval(interval);
      TerminalEventEmitter.off("open_new_terminal", openTerminal);
      TerminalEventEmitter.off("close_active_terminal", closeTerminal);
      TerminalEventEmitter.off("submit_terminal", submit);
      TerminalEventEmitter.off("loop_toggle", toggleLoop);
      TerminalEventEmitter.off("focus_terminal", focusTerminal);
    };
  }, [terminalContent, terminalHistory, terminalArgs, loop]);

  const exitMap: KeyBinding = {
    key: "Escape",
    win: "Escape",
    run: () => {
      if (props.editor.current?.view?.hasFocus) {
        TerminalEventEmitter.emit("close_active_terminal", undefined);
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
    <>

      <AnimatePresence>
        {terminalActive && (
          <motion.div
            key="terminal"
            transition={{ duration: 0.2 }}
            // initial={{ translateY: 30 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: terminalActive ? (hasFocus ? 1 : 0.8) : 0.0 }}
            // exit={{ translateY: 30 }}
            exit={{ opacity: 0 }}
            style={{
              width: "300px",
              position: "absolute",
              bottom: 30,
              left: window.innerWidth / 2 - 150,
              // position: "rel",
              display: "flex",
              flexDirection: "row",
              backgroundColor: bgColor,
              zIndex: 1000,
              // opacity: hasFocus ? 1 : 0.5,
            }}
          >
            <div
              id="loop-button"
              onClick={() => {
                setLoop(!loop);
              }}
              style={{
                width: "26.4px",
                height: terminalActive ? "26.4px" : "0px",
                backgroundColor: loop ? "#32a852" : "#433e54",
                transitionDuration: "0.2s",
              }}
            >
              <motion.div
                transition={{ duration: 0.5 }}
                animate={{ rotate: loop ? 360 : 0 }}
                style={{
                  position: "relative",
                  width: "100%",
                  height: "100%",
                  //backgroundImage: `url(${LoopTexture})`,
                  backgroundSize: "80%",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                }}
              />
            </div>
            <CodeMirror
              className="block-game-input"
              ref={props.editor}
              value={terminalContent}
              theme={duotone.duotoneDark}
              height={"100%"}
              width="100%"
              extensions={[
                Prec.highest(keymap.of([exitMap, previousMap, nextMap])),

                javascript({
                  typescript: true
                }),

                autocompletion({
                  override: [tsComplete],
                  activateOnTyping: true,
                  filterStrict: false,
                  aboveCursor: true,
                  maxRenderedOptions: 30,
                }),
              ]}
              onChange={(c) => {
                setHasModified(true);
                setTerminalContent(c);
                setLastTypedTime(Date.now());
                setHasFocus(true);
              }}

            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/*
  <div style={{
  position: "absolute",
  top: trackingScreenPosition.y - (300 * trackingScale) / 2,
  left: trackingScreenPosition.x - (300 * trackingScale) / 2,
  width: `${300 * trackingScale}px`,
  height: `${300 * trackingScale}px`,
  backgroundColor: "rrd",
}} />

*/
