import { autocompletion } from "@codemirror/autocomplete";
import "./Terminal.css";
import { bgColor, fgColor } from "@/style";
import { javascript } from "@codemirror/lang-javascript";
import * as duotone from "@uiw/codemirror-theme-duotone";
import { saveFile, typescriptCompletionSource } from "../../../tsUtils";
import Player from "@game/player/session_manager";
import mitt, { Emitter } from "mitt";
import { AnimatePresence } from "framer-motion";
import { motion } from "framer-motion";
import { Prec } from "@codemirror/state";
import LoopTexture from "@/assets/loop.png";
import CodeMirror, {
  EditorState,
  KeyBinding,
  keymap,
  ReactCodeMirrorRef,
} from "@uiw/react-codemirror";
import React, { useCallback, useEffect, useState } from "react";
import hotkey from "hotkeys-js";
import { TerminalEventEmitter, TerminalOpenArgs } from "./TerminalHandler";
import { s } from "node_modules/framer-motion/dist/types.d-6pKw1mTI";
import GameHelpers from "@game/player/interface/game_helpers?raw";

export interface TerminalProps {
  editor: React.RefObject<ReactCodeMirrorRef>;
}

export function Terminal(props: TerminalProps) {

  const [terminalPosition, setTerminalPosition] = useState(() => {
    return {
      x: 0,
      y: 0,
    };
  });


  const [terminalActive, setTerminalActive] = useState(false);
  const [oldTerminalContent, setOldTerminalContent] = useState("");
  const [hasFocus, setHasFocus] = useState(false);
  const [terminalRunning, setTerminalRunning] = useState(false);
  const [terminalHistory, setTerminalHistory] = useState<string[]>([]);

  const [commandCount, setCommandCount] = useState(() => {
    return 0
  });

  const clearContent = useCallback(() => {
    // return `//Command #${commandCount}\n`;
    return "";
  }, []);
  const [terminalContent, setTerminalContent] = useState("");

  const [hasModified, setHasModified] = useState(false);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [loop, setLoop] = useState(false);

  const openTerminal = useCallback((args: TerminalOpenArgs) => {
    console.log("Opening terminal");
    setTerminalActive(true);
    setHasFocus(true);

    Player.openTerminal(args.mousePosition);

    // let clearContent = "";

    // if (args.mousePosition) {
    //   const world = Player.bridge.screenToWorld(args.mousePosition[0], args.mousePosition[1]);
    //   clearContent += `const dropPoint : Vector3 = new Vector3(${world.x.toFixed(2)}, ${world.y.toFixed(2)}, 0);\n`;
    // }

    // if (args.fromSelection) {
    //   clearContent += `const selected : BoidInterface[] = [...selection];\n`;
    // }


    setTimeout(() => {
      setTerminalContent(clearContent);
      setTimeout(() => {
        setCursorToLast();
      }, 10);
    }, 100);
  }, [terminalActive, props.editor]);

  const closeTerminal = useCallback(() => {
    setTerminalActive(false);
    setTerminalContent(clearContent());
    Player.closeTerminal();
  }, [terminalActive, props.editor]);

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

      const cursorPosition = props.editor.current?.view?.state.selection.main.head;

      // ENsure if going up, terminal content is empty or the content is not modified
      if (up && terminalContent && hasModified ) {
        return false;
      }

      // Ensure if going down, content is not modified
      if (!up && hasModified && cursorPosition ) {
        return false;
      }

      if (!up && cursorPosition !== props.editor.current?.view?.state.doc.length) {
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
    [terminalHistory, hasModified, terminalContent, props.editor.current?.view?.state.selection.main.head]
  );

  const runCode = useCallback(async () => {
    const code = terminalContent;
    if (code) {
      try {

        // get the first line, if it is a comment use it as the title
        const firstLine = code.split("\n")[0];
        const title = firstLine.startsWith("//") ? firstLine : undefined;
        // remove // from the title
        
        const titleStr = title ? title.replace("//", "").trim() : "Command #" + commandCount;

        // Start from #region HELPERS and end at #endregion HELPERS
        const helperFns = GameHelpers.substring(
          GameHelpers.indexOf("//#region HELPERS")
        ) + "\n";



        Player.runCode( titleStr, helperFns + code, {
          mousePosition: [terminalPosition.x, terminalPosition.y],
          loop: loop,
        });

        setCommandCount((c) => c + 1);
      } catch (e) {
        console.error(e);
      }
    }
  }, [terminalContent, loop, terminalHistory, commandCount]);

  const toggleLoop = useCallback(() => {
    console.log("Toggling Loop");
    setLoop((l) => !l);
  }, []);

  const tsComplete: any = useCallback(
    (context: ReactCodeMirrorRef) => {
      let preCode = GameHelpers + "\n"
        .trim()
        .toString();

      // preCode = preCode.replace("@/", "/gameTypes/");
      // replace all
      preCode = preCode.replace(/@/g, "/gameTypes/");
      
      return typescriptCompletionSource(
        context,
        preCode + "\n" + oldTerminalContent + "\n"
      );
    },
    [oldTerminalContent]
  );

  useEffect(() => {
    const submit = () => {
      if (terminalActive && props.editor.current?.view?.hasFocus) {
        runCode().then(() => {
          // NOT ERROR -> SAVE TO GLOBAL LIST FOR INTELLISENSE - FOR THIS CONTEXT
        });

        setLoop(false);
        setTerminalHistory((h) => [...h, terminalContent]);
        setOldTerminalContent((c) => c + terminalContent + "\n");
        setHistoryIndex((i) => terminalHistory.length + 1);
        setTimeout(() => {
          setTerminalContent(clearContent());
          setCursorToLast();  
        },0);
        // closeTerminal();
      }
    };

   

    TerminalEventEmitter.on("open_new_terminal", openTerminal);
    TerminalEventEmitter.on("close_active_terminal", closeTerminal);
    TerminalEventEmitter.on("submit_terminal", submit);
    TerminalEventEmitter.on("loop_toggle", toggleLoop);

    return () => {
      TerminalEventEmitter.off("open_new_terminal", openTerminal);
      TerminalEventEmitter.off("close_active_terminal", closeTerminal);
      TerminalEventEmitter.off("submit_terminal", submit);
      TerminalEventEmitter.off("loop_toggle", toggleLoop);
    };
  }, [terminalActive, terminalContent, terminalHistory, runCode]);

  const exitMap: KeyBinding = {
    key: "Escape",
    win: "Escape",
    run: () => {
      if (terminalActive && props.editor.current?.view?.hasFocus) {
        closeTerminal();
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
          onMouseEnter={() => {
            setHasFocus(true);
          }}
          onMouseLeave={() => {
            setHasFocus(false);
          }}
          transition={{ duration: 0.2 }}
          // initial={{ translateY: 30 }}
          initial={{ opacity: 0, }}
          animate={{ opacity: hasFocus ? 1 : 0.5, translateY: 0 }}
          // exit={{ translateY: 30 }}
          exit={{ opacity: 0 }}
          style={{
            width: "100vw",
            // position: "rel",
            display: "flex",
            flexDirection: "row",
            backgroundColor: bgColor,
            zIndex: 1000,
            // left: 0,
            // bottom: 0,
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
              height: "26.4px",
              backgroundColor: loop ? "#32a852" : "#433e54",
            }}
          >
            <motion.div
              transition={{ duration: 0.5 }}
              animate={{ rotate: loop ? 360 : 0 }}
              style={{
                position: "relative",
                width: "100%",
                height: "100%",
                backgroundImage: `url(${LoopTexture})`,
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
                typescript: true,
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
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
