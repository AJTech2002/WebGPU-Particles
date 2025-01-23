import { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";
import Stats from "stats.js";
import { autocompletion } from "@codemirror/autocomplete";
import { saveFile, typescriptCompletionSource } from "./tsUtils";
import { javascript } from "@codemirror/lang-javascript";
import CodeMirror, {
  EditorView,
  KeyBinding,
  keymap,
  ReactCodeMirrorRef,
} from "@uiw/react-codemirror";
import * as duotone from "@uiw/codemirror-theme-duotone";
import Player from "./game/player/session_manager";

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [code, setCode] = useState<string>("");
  const editor = useRef<ReactCodeMirrorRef>(null);

  const memoizedCanvas = useMemo(() => {
    return <canvas id="canvas" ref={canvasRef}></canvas>;
    
  }, []);

  const customKeyMap: KeyBinding = {
    key: "Ctrl-Enter",
    win: "Control-Enter",
    run: (editor: EditorView) => {
      const transpiledCode = saveFile(code);
      if (transpiledCode === null) {
        console.error("Error transpiling code");
        return false;
      }
      Player.runCode(transpiledCode);
      return true;
    },
  };

  useEffect(() => {
    if (canvasRef.current && editor.current) {
      // FPS Stats
      const stats = new Stats();
      stats.showPanel(0);
      document.body.appendChild(stats.dom);

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

  return (
    <>
      <div
        style={{
          width: "100vw",
          height: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {memoizedCanvas}
      </div>
      <CodeMirror
        ref={editor}
        value={code}
        theme={duotone.duotoneDark}
        style={{
          position: "absolute",
          bottom: 0,
        }}
        height="100%"
        width="100vw"
        extensions={[
          javascript({
            typescript: true,
          }),
          keymap.of([customKeyMap]),
          // add a keybind to submit

          autocompletion({
            override: [typescriptCompletionSource as any],
            activateOnTyping: true,
            filterStrict: true,
            aboveCursor: true,
            maxRenderedOptions: 30,
          }),
        ]}
        onChange={setCode}
      />
    </>
  );
}

export default App;
