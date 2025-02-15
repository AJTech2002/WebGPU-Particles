import mitt from "mitt";

export interface TerminalOpenArgs {
  mousePosition?: [number, number];
  fromSelection?: boolean;
}

export type TerminalEvents = {
  open_new_terminal: TerminalOpenArgs;
  close_active_terminal: void;
  submit_terminal: void;
  loop_toggle: void;
};

export const TerminalEventEmitter = mitt<TerminalEvents>();

const onMouseMove = (e: MouseEvent) => {
  if (e && e.clientX && e.clientY) {
    (window as any).lastMouseX = e.clientX;
    (window as any).lastMouseY = e.clientY;
  }
};

const onMouseDown = (e: MouseEvent) => {
  if (e && e.clientX && e.clientY && (e.ctrlKey || e.metaKey)) {
    (window as any).lastMouseX = e.clientX;
    (window as any).lastMouseY = e.clientY;

    if (e.button === 0) {
      TerminalEventEmitter.emit("open_new_terminal", {
        mousePosition: [e.clientX, e.clientY],
      });
    }
  }
};

const submitTerminal = (e: KeyboardEvent) => {
  console.log("Key Pressed", e.key, e.ctrlKey, e.metaKey, e.shiftKey);
  if (e.key === "Enter" && (e.ctrlKey || e.metaKey || e.shiftKey)) {
    TerminalEventEmitter.emit("submit_terminal");
  } 
  
  if (e.key === "l" && (e.ctrlKey || e.metaKey)) {
    TerminalEventEmitter.emit("loop_toggle");
    console.log("Loop Toggle");
  }
  
};

window.addEventListener("keydown", submitTerminal);
window.addEventListener("mousedown", onMouseDown);
window.addEventListener("mouseenter", onMouseMove);
window.addEventListener("mousemove", onMouseMove);
