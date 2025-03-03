import { useEffect, useMemo, useRef } from "react";
import Stats from "stats.js";
import { ReactCodeMirrorRef } from "@uiw/react-codemirror";
import Player from "@game/player/session_manager";
import { Terminal } from "./game/Terminal";
import { useActiveRunningAsyncThreads } from "@game/player/code_runner/code_exec_manager";

export default function GameScreen() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const editor = useRef<ReactCodeMirrorRef>(null);
  const { runningFunctions } = useActiveRunningAsyncThreads();

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

    return () => {
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

      <Terminal editor={editor} />

    </div>
  );
}
