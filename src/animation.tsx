import { useState, useLayoutEffect, ReactNode, Children } from "react";
import { usePrevious } from "./hooks.js";
import { getKey } from "./utils.js";

type AnimationProps = { duration: number; children: ReactNode };

type BoundingBox = { [key: string]: DOMRect };

function calculateBoundingBoxes(children: ReactNode) {
  const boundingBoxes: BoundingBox = {};
  Children.forEach(children, (child) => {
    const key = getKey(child);
    if (key) boundingBoxes[key] = ((child as any).ref.current as HTMLElement).getBoundingClientRect();
  });
  return boundingBoxes;
}

export default function Animation({ duration, children }: AnimationProps) {
  const [boundingBox, setBoundingBox] = useState<BoundingBox>({});
  const prevBoundingBox = usePrevious(boundingBox);

  useLayoutEffect(() => {
    if (duration > 0) setBoundingBox(calculateBoundingBoxes(children));
    else setBoundingBox({});
  }, [children]);

  useLayoutEffect(() => {
    if (duration > 0 && prevBoundingBox && Object.keys(prevBoundingBox).length)
      Children.forEach(children, (child) => {
        const domNode: HTMLElement = (child as any)?.ref?.current;
        const key = getKey(child);
        if (!key) return;
        const { left: prevLeft, top: prevTop }: DOMRect = prevBoundingBox[key] || {};
        const { left, top }: DOMRect = boundingBox[key];
        const changeInX = prevLeft - left,
          changeInY = prevTop - top;
        if (changeInX || changeInY)
          requestAnimationFrame(() => {
            domNode.style.transform = `translate(${changeInX}px, ${changeInY}px)`;
            domNode.style.transition = "none";
            requestAnimationFrame(() => {
              domNode.style.transform = "";
              domNode.style.transition = `transform ${duration}ms`;
            });
          });
      });
  }, [boundingBox]);

  return children;
}
