import { useEffect, useRef, useState } from 'react'
import './App.css'
import Engine, { createEngine } from '@engine/engine';
import BoidScene from './game/boid_scene';
import { autocompletion } from '@codemirror/autocomplete';
import { saveFile, typescriptCompletionSource } from './tsUtils';
import { javascript } from '@codemirror/lang-javascript';
import CodeMirror, { ReactCodeMirrorRef } from '@uiw/react-codemirror';
import * as duotone from "@uiw/codemirror-theme-duotone";

function App() {

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [code, setCode] = useState<string>("");
  const editor = useRef<ReactCodeMirrorRef>(null); 

  useEffect(() => {
    
    if (canvasRef.current) {
      const engine : Promise<Engine> = createEngine(canvasRef.current, new BoidScene());
      console.log("Engine", engine);
    }

  }, []);

  return (
    <>
      <div style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <canvas id="canvas" ref={canvasRef}></canvas>
      </div>
      <CodeMirror
        ref={editor}
        value={code}
        theme={duotone.duotoneDark}
        style={{
          position: 'absolute',
          bottom: 0,
        }}
        height="100%"
        width="100vw"
        extensions={[javascript({
          typescript: true
        }),
        autocompletion({
          override: [typescriptCompletionSource as any],
          activateOnTyping: true,
          filterStrict: true,
          aboveCursor: true,
          maxRenderedOptions: 30,
        })

        ]}
        onChange={setCode}

      />
    </>
  )
}

export default App
