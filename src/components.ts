import { Children, useLayoutEffect } from "react";
import { useStateWithHistory } from "./hooks.js";
import { calculateBoundingBoxes, getKey } from "./lib/react.js";
import { AnimationProps, BoundingBox, Child } from "./types.js";

export function Animation({ duration, children }: AnimationProps) {
  const [boundingBox, prevBoundingBox, setBoundingBox] = useStateWithHistory<BoundingBox>({});

  useLayoutEffect(() => {
    if (duration > 0) setBoundingBox(calculateBoundingBoxes(children));
    else setBoundingBox({});
  }, [children]);

  useLayoutEffect(() => {
    if (duration > 0 && prevBoundingBox && Object.keys(prevBoundingBox).length)
      Children.forEach(children, (child) => {
        const key = getKey(child);
        if (!key) return;
        const domNode = (child as Child).props.ref.current;
        const { left: prevLeft, top: prevTop } = prevBoundingBox[key] || {};
        const { left, top } = boundingBox[key];
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
