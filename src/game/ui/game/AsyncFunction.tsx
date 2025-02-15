
import PlayButtonIcon from "@assets/Play.png";
import StopButtonIcon from "@assets/Stop.png";
import PauseButtonIcon from "@assets/Pause.png";
import { RunningHandler } from "@game/player/code_runner/code_exec_manager";
import { useState } from "react";

export interface AsyncFunctionVisualProps {
  handler: RunningHandler;
}

export const AsyncFunctionVisual = (props: AsyncFunctionVisualProps) => {

  const [paused, setPaused] = useState(false);

  return (
    <div className="async-fn-indicator block-game-input" onClick={(e) => {
      e.stopPropagation();
    }}>
      <p style={{
        maxWidth: '100px',
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        userSelect: 'none',
      }}>{props.handler.title}</p>
      <div style={{
        flex: 1,
      }}></div>
      <div
      className="icon"
      onClick={() => {
        props.handler.cancelExecution();
      }}
      style={{
        marginLeft: '10px',
        width: '13px',
        height: '13px',
        backgroundImage: `url(${StopButtonIcon})`,
      }}></div>
      <div 
      className="icon"
      onClick={() => {
        if (paused) {
          props.handler.resumeCode();
          setPaused(false);
        } else {
          props.handler.pauseCode();
          setPaused(true);
        }
      }}
      style={{
        marginLeft: '5px',
        marginRight: '10px',
        width: '15px',
        height: '15px',
        backgroundImage: `url(${paused ? PlayButtonIcon : PauseButtonIcon})`,
      }}></div>
    </div>
  );
}