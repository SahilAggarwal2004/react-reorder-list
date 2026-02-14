import React, { Children, DragEvent, JSX, ReactNode, RefObject, cloneElement, createRef, isValidElement, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

import { useStateWithHistory } from "./hooks.js";
import { calculateBoundingBoxes, getKey } from "./lib/react.js";
import type { AnimationProps, BoundingBox, Child } from "./types.js";

import { scrollThreshold } from "./constants.js";
import { useDraggable } from "./hooks.js";
import { PiDotsSixVerticalBold } from "./icons.js";
import { swap } from "./lib/utils.js";
import type { DivProps, ReorderItemProps, ReorderListProps } from "./types.js";

// @ts-ignore
if (typeof window !== "undefined") import("drag-drop-touch");

function Animation({ duration, children }: AnimationProps) {
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

export function ReorderIcon({ children = <PiDotsSixVerticalBold />, style, ...props }: DivProps) {
  return (
    <span style={{ cursor: "grab", ...style }} {...props}>
      {children}
    </span>
  );
}

function ReorderItem({ useOnlyIconToDrag, disable, ref, style, children, onTouchEnd: propOnTouchEnd, ...events }: ReorderItemProps) {
  const { draggable, onTouchEnd: draggableOnTouchEnd, ...draggableProps } = useDraggable();

  const recursiveClone = (children: ReactNode): ReactNode =>
    Children.map(children, (child) => {
      if (!isValidElement(child)) return child;
      return cloneElement(child, child.type === ReorderIcon ? draggableProps : {}, recursiveClone((child as JSX.Element).props.children));
    });

  const recursiveChildren = useMemo(() => (useOnlyIconToDrag ? recursiveClone(children) : children), [useOnlyIconToDrag, children]);

  return (
    <div
      ref={ref}
      draggable={!disable && draggable}
      style={{ ...style, touchAction: "pan-y", cursor: useOnlyIconToDrag ? "default" : "grab" }}
      {...(!disable && {
        ...events,
        ...(!useOnlyIconToDrag && draggableProps),
        onTouchEnd: (event) => {
          draggableOnTouchEnd(event);
          propOnTouchEnd(event);
        },
      })}
    >
      {recursiveChildren}
    </div>
  );
}

export default function ReorderList({ useOnlyIconToDrag = false, selectedItemOpacity = 0.5, animationDuration = 300, watchChildrenUpdates = false, preserveOrder = false, onPositionChange, disabled = false, props, children }: ReorderListProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [start, setStart] = useState(-1);
  const [selected, setSelected] = useState(-1);
  const [items, setItems] = useState<ReactNode[]>(Children.toArray(children));
  const [temp, setTemp] = useState<{ items: ReactNode[]; rect?: DOMRect }>({ items: [] });
  const [isAnimating, setIsAnimating] = useState(false);
  const [scroll, setScroll] = useState<{ left: number; top: number }>();
  const [refs, disableArr] = useMemo(
    () =>
      items.reduce<[RefObject<HTMLDivElement | null>[], boolean[]]>(
        ([refs, disableArr], item) => {
          return [refs.concat(createRef<HTMLDivElement>()), disableArr.concat((item as JSX.Element)?.props?.["data-disable-reorder"])];
        },
        [[], []],
      ),
    [items],
  );

  const findIndex = (key: string | null) => (key ? items.findIndex((item) => (item as JSX.Element)?.key === key) : -1);

  function handleDragEnd(event: DragEvent | null) {
    if (event) {
      event.stopPropagation();
      if (selected !== start) onPositionChange?.({ start, end: selected, oldItems: temp.items, newItems: items, revert: () => setItems(temp.items) });
    }
    setStart(-1);
    setSelected(-1);
  }

  useEffect(() => {
    if (!watchChildrenUpdates) return;
    if (selected !== -1) handleDragEnd(null);
    const items: ReactNode[] = [];
    const newItems: ReactNode[] = [];
    Children.forEach(children, (child, index) => {
      if (preserveOrder) index = findIndex((child as JSX.Element)?.key);
      if (index === -1) newItems.push(child);
      else items[index] = child;
    });
    setItems(items.filter((item) => item !== undefined).concat(newItems));
  }, [children]);

  useEffect(() => {
    if (!scroll) return;
    const { left, top } = scroll;
    const { scrollWidth, scrollHeight } = document.body;
    const interval = setInterval(() => {
      if (left < 0 || top < 0 || scrollWidth - scrollX > innerWidth - left || scrollHeight - scrollY > innerHeight - top) scrollBy({ left, top, behavior: "instant" });
    }, 20);
    return () => clearInterval(interval);
  }, [scroll]);

  return (
    <div ref={ref} {...props}>
      {disabled ? (
        children
      ) : (
        <Animation duration={+(start !== -1 && !scroll) && animationDuration}>
          {items.map((child, i) => {
            if (!isValidElement(child)) return child;
            return (
              <ReorderItem
                key={child.key}
                ref={refs[i]}
                useOnlyIconToDrag={useOnlyIconToDrag}
                disable={disableArr[i]}
                style={{ opacity: selected === i ? selectedItemOpacity : 1 }}
                onDragStart={(event) => {
                  event.stopPropagation();
                  setStart(i);
                  setSelected(i);
                  setTemp({ items, rect: (ref.current!.childNodes[i] as HTMLDivElement).getBoundingClientRect?.() || {} });
                }}
                onDragEnter={(event) => {
                  event.stopPropagation();
                  if (start === -1 || selected === i || isAnimating) return;
                  const { width: startWidth, height: startHeight } = temp.rect!;
                  const { left, top, width, height } = (event.target as HTMLDivElement).getBoundingClientRect();
                  if (event.clientX - left > Math.min(startWidth, width) || event.clientY - top > Math.min(startHeight, height)) return;
                  setSelected(i);
                  setItems(() => {
                    const items = temp.items.slice();
                    const shiftForward = start < i;
                    const increment = shiftForward ? 1 : -1;
                    let key = start;
                    for (let index = start + increment; shiftForward ? index <= i : index >= i; index += increment) {
                      if (disableArr[index]) continue;
                      swap(items, key, index);
                      key = index;
                    }
                    return items;
                  });
                  setIsAnimating(true);
                  setTimeout(() => setIsAnimating(false), animationDuration);
                }}
                onDragEnd={handleDragEnd}
                onTouchMove={(event) => {
                  if (start === -1) return;
                  const { clientX, screenX, clientY, screenY } = event.touches[0];
                  let left = 0,
                    top = 0;
                  if (clientX < scrollThreshold.x) left = -5;
                  else if (innerWidth - screenX < scrollThreshold.x) left = 5;
                  if (clientY < scrollThreshold.y) top = -10;
                  else if (innerHeight - screenY < scrollThreshold.y) top = 10;
                  setScroll(left || top ? { left, top } : undefined);
                }}
                onTouchEnd={() => setScroll(undefined)}
              >
                {child}
              </ReorderItem>
            );
          })}
        </Animation>
      )}
    </div>
  );
}
