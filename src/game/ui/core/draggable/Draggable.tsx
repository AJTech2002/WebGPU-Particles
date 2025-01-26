import React from 'react';
import {useDraggable} from '@dnd-kit/core';
import {CSS} from '@dnd-kit/utilities';

export interface DraggableProps {
  id: string;
  children: React.ReactNode;
}

export function Draggable(props : DraggableProps) {
  const {attributes, listeners, setNodeRef, transform} = useDraggable({
    id: props.id,
  });

  const style = {
    // Outputs `translate3d(x, y, 0)`
    transform: CSS.Translate.toString(transform),
    // Opacity is set to 0.5 when the item is being dragged
    opacity: transform ? 0.5 : 1,
  };


  return (
    <div ref={setNodeRef} {...listeners} {...attributes} style={style}>
      {props.children}
    </div>
  );
}