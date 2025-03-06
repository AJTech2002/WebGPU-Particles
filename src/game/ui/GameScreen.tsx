import { createContext, useEffect, useMemo, useRef, useState } from "react";
import Stats from "stats.js";
import { ReactCodeMirrorRef } from "@uiw/react-codemirror";
import Player from "@game/player/session_manager";
import { Terminal } from "./game/Terminal";
import { useActiveRunningAsyncThreads } from "@game/player/code_runner/code_exec_manager";
import "./GameScreen.css";
import { ActionItem, ActionItemData } from "./game/ActionItem";
import { TerminalEventEmitter, TerminalOutputs } from "./game/TerminalHandler";

// Code State Context 

type CodeStateContextType = {
  writingCode: boolean;
};


const CodeStateContext = createContext<CodeStateContextType>({
});


export default function GameScreen() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const editor = useRef<ReactCodeMirrorRef>(null);
  const { runningFunctions } = useActiveRunningAsyncThreads();
  const [showActionBar, setShowActionBar] = useState(true);
  const memoizedCanvas = useMemo(() => {
    return <canvas id="canvas" ref={canvasRef}></canvas>;
  }, []);



  useEffect(() => {
    if (canvasRef.current) {
      // FPS Stats
      const stats = new Stats();
      stats.showPanel(0);
      Player.init(canvasRef.current, stats);
    }

    const onOpenTerminal = (args) => {
      setShowActionBar(false);
    };

    const onCloseTerminal = () => {
      setShowActionBar(true);
    };

    TerminalEventEmitter.on("open_new_terminal", onOpenTerminal);
    TerminalEventEmitter.on("close_active_terminal", onCloseTerminal);

    return () => {

      TerminalEventEmitter.off("open_new_terminal", onOpenTerminal);
      TerminalEventEmitter.off("close_active_terminal", onCloseTerminal);

      if (Player) Player.dispose();
    };
  }, []);

  return (

    <div>
      {/* Canvas */}
      <div
        style={{
          width: "100vw",
          position: "absolute",
          top: 0,
          left: 0,
          height: "100vh",
        }}
      >
        {memoizedCanvas}
      </div>

      {showActionBar && <div style={{
        position: "absolute",
        left: '50%',
        transform: 'translateX(-50%)',
        bottom: 30,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-around",
        alignItems: "start",
        //backgroundColor: 'red'
      }}>
        <p id="selected-fn" style={{
          margin: 0,
        }}>Hovering Fn</p>
        <div style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-around",
          alignItems: "center",
        }}>
          <div id="bottom-action-bar" className="block-game-input">
            <ActionItem id={0} group="main" />
            <ActionItem id={1} group="main" />
            <ActionItem id={2} group="main" />
            <ActionItem id={3} group="main" />
          </div>

          <div style={{
            display: 'flex',
            marginLeft: '20px',
            width: 40,
            height: 40,
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
          }} className="action-bar-item"

            onClick={() => {
              TerminalEventEmitter.emit("open_new_terminal", {
                id: "global",
                mousePosition: [window.lastMouseX, window.lastMouseY],
                onSubmit: (outputs: TerminalOutputs) => {
                  console.log(outputs);
                  if (outputs.code)
                    Player.runCode("global", outputs.code, outputs.loop);
                }
              });


            }}

          >
            <p>{"/>"}</p>
          </div>

        </div>
      </div>
      }
      <Terminal editor={editor} />

    </div>
  );
}
