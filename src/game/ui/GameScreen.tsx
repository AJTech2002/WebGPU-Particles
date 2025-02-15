import { useContext, useEffect, useMemo, useRef } from "react";
import Stats from "stats.js";
import { ReactCodeMirrorRef } from "@uiw/react-codemirror";
import Player from "@game/player/session_manager";
import { DndContext, PointerSensor, useSensor } from "@dnd-kit/core";
import { CardCodingContext } from "@/App";
import { Terminal } from "./game/Terminal";
import { useActiveRunningAsyncThreads } from "@game/player/code_runner/code_exec_manager";
import { AsyncFunctionVisual } from "./game/AsyncFunction";
import { AnimatePresence, motion } from "framer-motion";
import { bgColor, fgColor } from "@/style";

export default function GameScreen() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const editor = useRef<ReactCodeMirrorRef>(null);
  const { runningFunctions } = useActiveRunningAsyncThreads();

  const memoizedCanvas = useMemo(() => {
    return <canvas id="canvas" ref={canvasRef}></canvas>;
  }, []);

  const pointerSensor = useSensor(PointerSensor, {
    activationConstraint: {
      distance: 10, // Drag starts after moving 10 pixels
      // or
    },
  });

  useEffect(() => {
    if (canvasRef.current) {
      // FPS Stats
      const stats = new Stats();
      stats.showPanel(0);
      // document.body.appendChild(stats.dom);
      Player.init(canvasRef.current, stats);
    }

    return () => {
      if (Player) Player.dispose();
    };
  }, []);

  useEffect(() => {
    if (editor.current) {
      // Player.updateEditorRef(editor.current);
    }
  }, [editor]);

  const CardContext = useContext(CardCodingContext);
  const {
    selectedCodeEditCard: selectedCard,
    setSelectedCodeEditCard: setSelectedCard,
  } = CardContext;

  return (
    <DndContext
      onDragEnd={(event) => {
        const id = event.active.id;
      }}
      sensors={[pointerSensor]}
    >
      <div>
        {/* Code Editor */}

        {/* <Terminal editor={editor}/> */}
        {/* Canvas */}
        <div
          style={{
            width: "100vw",
            // width: '%',
            position: "absolute",
            top: 0,
            left: 0,
            height: "100vh",
          }}
        >
          {memoizedCanvas}
        </div>

        {/* Top Bar */}
        <div style={{ position: "absolute", display: "flex", justifyContent: "center", alignItems: "center", top: 0, width: "100vw" }}>
            <div style={{
              width: "150px",
              height: "35px",
              backgroundColor: bgColor,
              borderRadius: "0px 0px 7px 7px",
            }}></div>
        </div>

        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            display: "flex",
            justifyContent: "flex-end",
            flexDirection: "column",
            width: "100vw",
          }}
        >
          <AnimatePresence>
            <div
              style={{
                paddingBottom: "10px",
                display: "flex",
                justifyContent: "flex-end",
                flexDirection: "column",
                position: "initial",
              }}
            >
              {runningFunctions.map((fn, i) => {
                return (
                  <motion.div
                  layout
                    initial={{ translateX: -200 }}
                    transition={{ duration: 0.2 }}
                    animate={{ translateX: fn.completed ? -200 : 0 }}
                    exit={{ translateX: -200 }}
                    key={i}
                  >
                    <AsyncFunctionVisual key={i + "_visual"} handler={fn} />
                  </motion.div>
                );
              })}
            </div>
          </AnimatePresence>

          <Terminal editor={editor} />
        </div>
      </div>
    </DndContext>
  );
}
