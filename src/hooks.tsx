import { useEffect, useRef, useState } from "react";

export function useDraggable(initValue: boolean = false) {
  const [draggable, setDraggable] = useState(initValue);
  const enableDragging = () => setDraggable(true);
  const disableDragging = () => setDraggable(false);
  const draggableProps = { onMouseEnter: enableDragging, onMouseLeave: disableDragging, onTouchStart: enableDragging, onTouchEnd: disableDragging };

  return [draggable, draggableProps] as const;
}

export function usePrevious<T>(value: T): T | null {
  const prevChildrenRef = useRef<T>(null);
  useEffect(() => {
    prevChildrenRef.current = value;
  }, [value]);
  return prevChildrenRef.current;
}
