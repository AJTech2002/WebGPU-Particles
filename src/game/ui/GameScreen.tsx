import { useContext, useEffect, useMemo, useRef } from "react";
import Stats from "stats.js";
import { ReactCodeMirrorRef } from "@uiw/react-codemirror";
import Player from "@game/player/session_manager";

import { CodeEditor } from "@game/ui/game/CodeEditor";
import { DndContext, PointerSensor, useSensor } from "@dnd-kit/core";
import CardTray from "@game/ui/game/CardTray";
import { CardCodingContext } from "@/App";
import { useSquads } from "./game/SquadProvider";
import { saveFile } from "@/tsUtils";

export default function GameScreen() {

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const editor = useRef<ReactCodeMirrorRef>(null);
  const {squadState, clearSquads} = useSquads();

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
    if (canvasRef.current && editor.current) {
      // FPS Stats
      const stats = new Stats();
      stats.showPanel(0);
      // document.body.appendChild(stats.dom);

      Player.init(canvasRef.current, editor.current, stats);
    }

    return () => {
      if (Player) Player.dispose();
    };
  }, []);

  useEffect(() => {
    if (editor.current) {
      Player.updateEditorRef(editor.current);
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
        if (id)
        {
          const squad = squadState.get(Number.parseFloat(id.toString()))
          if (squad) {
            Player.beginSquad(squad);
          }
        }
      }}
      sensors={[pointerSensor]}
    >
      <div>
        {/* Code Editor */}
        <CodeEditor
          editor={editor}
          editorOpen={selectedCard !== undefined}
          onUnFocus={() => {
            setSelectedCard(undefined);
          }}
        />
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
        <CardTray />
      </div>
    </DndContext>
  );
}
