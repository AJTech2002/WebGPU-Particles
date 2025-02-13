import { useContext, useEffect, useMemo, useRef } from "react";
import Stats from "stats.js";
import { ReactCodeMirrorRef } from "@uiw/react-codemirror";
import Player from "@game/player/session_manager";

import { CodeEditor } from "@game/ui/game/CodeEditor";
import { DndContext, PointerSensor, useSensor } from "@dnd-kit/core";
import { CardCodingContext } from "@/App";
import { saveFile } from "@/tsUtils";
import { Terminal } from "./game/Terminal";

export default function GameScreen() {

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const editor = useRef<ReactCodeMirrorRef>(null);

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
      Player.init(canvasRef.current,  stats);

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
        <Terminal editor={editor}/>
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
        {/* Card Tray */}
      </div>
    </DndContext>
  );
}
