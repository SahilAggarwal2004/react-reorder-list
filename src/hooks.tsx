import { useState } from "react";

export function useDraggable(initValue: boolean = false) {
  const [draggable, setDraggable] = useState(initValue);
  const enableDragging = () => setDraggable(true);
  const disableDragging = () => setDraggable(false);
  const draggableProps = { onMouseEnter: enableDragging, onMouseLeave: disableDragging, onTouchStart: enableDragging, onTouchEnd: disableDragging };

  return [draggable, draggableProps] as const;
}

export function useStateWithHistory<T>(initValue: T) {
  const [state, setState] = useState<T>(initValue);
  const [prevState, setPrevState] = useState<T>();

  function setStateWithHistory(value: T) {
    setPrevState(state);
    setState(value);
  }

  return [state, prevState, setStateWithHistory] as const;
}
