import { MouseEvent, TouchEvent, useState } from "react";

export function useDraggable(initValue: boolean = false) {
  const [draggable, setDraggable] = useState(initValue);
  const enableDragging = (event: MouseEvent | TouchEvent) => {
    event.stopPropagation();
    setDraggable(true);
  };
  const disableDragging = (event: MouseEvent | TouchEvent) => {
    event.stopPropagation();
    setDraggable(false);
  };
  const draggableProps = { onMouseEnter: enableDragging, onMouseLeave: disableDragging, onTouchStart: enableDragging, onTouchEnd: disableDragging };

  return { draggable, draggableProps };
}
