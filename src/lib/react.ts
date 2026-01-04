import { ReactNode, Children, JSX } from "react";

import type { BoundingBox, Child } from "../types.js";

export const getKey = (child: ReactNode): string | undefined => (child as JSX.Element)?.key?.split("/.")[0];

export function calculateBoundingBoxes(children: ReactNode): BoundingBox {
  const boundingBoxes: BoundingBox = {};
  Children.forEach(children, (child) => {
    const key = getKey(child);
    if (key) boundingBoxes[key] = (child as Child).props.ref.current.getBoundingClientRect();
  });
  return boundingBoxes;
}
