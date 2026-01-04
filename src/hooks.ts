import { useCallback, useState } from "react";

import type { DivMouseEventHandler, DivTouchEventHandler } from "./types";

export function useDraggable(initValue: boolean = false): {
  draggable: boolean;
  onMouseEnter: DivMouseEventHandler;
  onMouseLeave: DivMouseEventHandler;
  onTouchStart: DivTouchEventHandler;
  onTouchEnd: DivTouchEventHandler;
} {
  const [draggable, setDraggable] = useState(initValue);
  const enableDragging = useCallback(() => setDraggable(true), []);
  const disableDragging = useCallback(() => setDraggable(false), []);

  return { draggable, onMouseEnter: enableDragging, onMouseLeave: disableDragging, onTouchStart: enableDragging, onTouchEnd: disableDragging };
}

export function useStateWithHistory<T>(initValue: T): readonly [T, T | undefined, (value: T) => void] {
  const [state, setState] = useState<T>(initValue);
  const [prevState, setPrevState] = useState<T>();

  function setStateWithHistory(value: T) {
    setPrevState(state);
    setState(value);
  }

  return [state, prevState, setStateWithHistory] as const;
}
