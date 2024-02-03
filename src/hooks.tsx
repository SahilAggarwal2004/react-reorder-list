import { DetailedHTMLProps, HTMLAttributes, useState } from "react";

export type Props = DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>;

export default function useDraggable(initValue: boolean = false) {
  const [draggable, setDraggable] = useState(initValue);
  const enableDragging = () => setDraggable(true);
  const disableDragging = () => setDraggable(false);
  const draggableProps: Props = { onMouseEnter: enableDragging, onMouseLeave: disableDragging, onTouchStart: enableDragging, onTouchEnd: disableDragging };

  return { draggable, draggableProps };
}
