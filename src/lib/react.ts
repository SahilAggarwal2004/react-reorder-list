import type { AnimationProps, BoundingBox } from "@/types";
import { Children } from "react";

export function calculateBoundingBoxes(children: AnimationProps["children"]): BoundingBox {
  const boundingBoxes: BoundingBox = {};
  Children.forEach(children, (child) => {
    const { key } = child;
    if (key) boundingBoxes[key] = child.props.ref.current.getBoundingClientRect();
  });
  return boundingBoxes;
}
