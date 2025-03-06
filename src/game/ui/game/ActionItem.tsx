import { useCallback, useEffect, useState } from "react";
import Player from "@game/player/session_manager";
import { TerminalEventEmitter } from "./TerminalHandler";
import { motion, useAnimation } from "framer-motion";
import { LoopOnce } from "@engine/math/src";
import { useActiveRunningAsyncThreads } from "@game/player/code_runner/code_exec_manager";

export interface ActionItemProps {
  id: number;
  group: string;
}

export interface ActionItemData {
  code: string;
  color: [number, number, number];
}

export function ActionItem(props: ActionItemProps) {


  const [item, setItem] = useState<ActionItemData | null>(null);
  const controls = useAnimation();
  const { runningFunctions, isRunning } = useActiveRunningAsyncThreads();
  const isRunningCode = isRunning(`${props.group}.${props.id}`);

  useEffect(() => {

    const localStorage = window.localStorage;
    const stored = localStorage.getItem("action_items");

    if (stored) {
      try {
        const actionItems = JSON.parse(stored);
        const group = actionItems[props.group];
        if (group) {
          const item = group[props.id];
          if (item) {
            setItem(item as ActionItemData);
          }
        }
      }
      catch (e) {
        localStorage.removeItem("action_items");
      }
    }

  }, []);

  const runCode = useCallback(() => {
    if (item && !isRunningCode) {
      Player.runCode(`${props.group}.${props.id}`, item.code, false);
    } else {
      Player.cancelExecution(`${props.group}.${props.id}`);
    }
  }, [item, props.group, props.id]);

  useEffect(() => {

    const run = (e) => {
      if (e.key === (props.id + 1).toString()) {
        runCode();
      }
    }

    window.addEventListener("keydown", run);

    return () => {
      window.removeEventListener("keydown", run);
    }

  }, [item]);

  const saveItem = (_item: ActionItemData) => {
    const localStorage = window.localStorage;
    const stored = localStorage.getItem("action_items");

    if (!stored) {
      localStorage.setItem("action_items", JSON.stringify({}));
    }

    if (stored) {
      try {
        const actionItems = JSON.parse(stored);

        if (!actionItems[props.group]) {
          actionItems[props.group] = {};
        }

        actionItems[props.group][props.id] = _item;

        localStorage.setItem("action_items", JSON.stringify(actionItems));
        console.log("Saved item", _item);
        setItem(_item);
      }
      catch (e) {
        console.error(e);
        localStorage.removeItem("action_items");
      }
    }
  }

  const handleClick = useCallback((e: MouseEvent) => {
    if (item && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
      runCode();
    }
    else {
      TerminalEventEmitter.emit("open_new_terminal", {
        id: `${props.group}.${props.id}`,
        code: item ? item.code : "",
        onSubmit: (outputs) => {
          console.log("Outputs", outputs);
          const _item: ActionItemData = {
            code: outputs.code,
            color: [Math.floor(Math.random() * 255), Math.floor(Math.random() * 255), Math.floor(Math.random() * 255)],
          };
          saveItem(_item);
          TerminalEventEmitter.emit("close_active_terminal", undefined);
        }
      });
    }
  }, [item, props.group, props.id]);


  let backgroundColor = item ? `rgb(${item.color[0]}, ${item.color[1]}, ${item.color[2]})` : undefined;

  if (isRunning(`${props.group}.${props.id}`)) {
    backgroundColor = "rgb(30, 30, 30)";
  }
  console.log("Is Running", isRunningCode);

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      {/* Pulsating Background */}
      {isRunningCode && (
        <motion.div
          initial={{ scale: 1, opacity: 0.6 }}
          animate={{
            scale: [1, 1.5],  // Expand outward
            opacity: [0.6, 0], // Fade out
          }}
          transition={{
            duration: 0.5,
            repeat: Infinity,
            ease: "easeOut",
            repeatType: "mirror",
          }}
          exit={{
            scale: 1,
            opacity: 0,
          }}
          style={{
            position: "absolute",
            top: 0, left: 0, right: 0, bottom: 0,
            borderRadius: "5px", // Make it circular if needed
            backgroundColor: backgroundColor,
            zIndex: 0, // Keep it behind the main div
          }}
        />
      )}

      {/* Main Interactive Motion Div */}
      <motion.div
        animate={controls}
        initial={{ width: 40, height: 40 }}
        whileHover={{ scale: 1.1 }}
        className="action-bar-item"
        style={{
          backgroundColor: backgroundColor,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          position: "relative",
          transition: "background-color 0.2s",
          zIndex: 1, // Ensure it's in front
        }}
        onClick={(e) => {
          handleClick(e.nativeEvent);
        }}
      >
        {(props.id + 1).toString()}
      </motion.div>
    </div>
  );
}
