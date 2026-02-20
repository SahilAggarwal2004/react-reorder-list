import React, { Children, cloneElement, createRef, DragEvent, isValidElement, JSX, Key, ReactNode, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

import { scrollThreshold } from "./constants";
import { useDraggable, useStateWithHistory } from "./hooks";
import { PiDotsSixVerticalBold } from "./icons";
import { calculateBoundingBoxes } from "./lib/react";
import { areOrdersEqual, swap } from "./lib/utils";
import type { AnimationProps, BoundingBox, DivProps, DivRef, Order, ReorderItemProps, ReorderListProps } from "./types";

// @ts-ignore
if (typeof window !== "undefined") import("drag-drop-touch");

function Animation({ duration, children }: AnimationProps) {
  const [boundingBox, prevBoundingBox, setBoundingBox] = useStateWithHistory<BoundingBox>({});

  useLayoutEffect(() => {
    if (duration > 0) setBoundingBox(calculateBoundingBoxes(children));
    else setBoundingBox({});
  }, [children]);

  useLayoutEffect(() => {
    if (duration <= 0 || !prevBoundingBox || !Object.keys(prevBoundingBox).length) return;

    children.forEach((child) => {
      const { key } = child;
      if (!key) return;
      const domNode = child.props.ref.current;
      if (!domNode) return;
      const { left: prevLeft, top: prevTop } = prevBoundingBox[key] || {};
      const { left, top } = boundingBox[key] || {};
      const changeInX = prevLeft - left;
      const changeInY = prevTop - top;
      if (!changeInX && !changeInY) return;
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

export default function ReorderList({ useOnlyIconToDrag = false, selectedItemOpacity = 0.5, animationDuration = 300, preserveOrder = true, onPositionChange, disabled = false, props, children }: ReorderListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef(new Map<Key, DivRef>());
  const [order, setOrder] = useState<Order>([]);
  const [dragState, setDragState] = useState<{ startIndex: number; currentIndex: number; startOrder: Order; startRect?: DOMRect }>();
  const [isAnimating, setIsAnimating] = useState(false);
  const [scroll, setScroll] = useState<{ left: number; top: number }>();

  const childMap = useMemo(() => {
    const map = new Map<Key, { child: ReactNode; disabled?: boolean }>();
    Children.forEach(children, (child) => {
      if (!isValidElement<{ "data-disable-reorder"?: boolean }>(child)) return;
      const { key, props } = child;
      if (!key) return;
      map.set(key, { child, disabled: props["data-disable-reorder"] });
    });
    return map;
  }, [children]);

  const orderedChildren = useMemo(() => {
    if (!order.length) return [];

    return order.flatMap((key, orderIndex) => {
      const { child, disabled } = childMap.get(key) || {};
      if (!isValidElement(child)) return [];

      const ref = getRef(key);
      const isSelected = dragState?.currentIndex === orderIndex;

      return (
        <ReorderItem
          key={key}
          ref={ref}
          useOnlyIconToDrag={useOnlyIconToDrag}
          disable={disabled}
          style={{ opacity: isSelected ? selectedItemOpacity : 1 }}
          onDragStart={(event) => {
            event.stopPropagation();
            setDragState({ startIndex: orderIndex, currentIndex: orderIndex, startOrder: [...order], startRect: ref.current?.getBoundingClientRect?.() || undefined });
          }}
          onDragEnter={(event) => {
            event.stopPropagation();
            if (!dragState || dragState.currentIndex === orderIndex || isAnimating) return;
            const { width: startWidth, height: startHeight } = dragState.startRect || { width: 0, height: 0 };
            const { left, top, width, height } = event.currentTarget.getBoundingClientRect();
            if (event.clientX - left > Math.min(startWidth, width) || event.clientY - top > Math.min(startHeight, height)) return;
            setDragState((prev) => (prev ? { ...prev, currentIndex: orderIndex } : undefined));
            setOrder(() => {
              const newOrder = [...dragState.startOrder];
              const shiftForward = dragState.startIndex < orderIndex;
              const increment = shiftForward ? 1 : -1;
              let currentPos = dragState.startIndex;
              for (let index = dragState.startIndex + increment; shiftForward ? index <= orderIndex : index >= orderIndex; index += increment) {
                const key = dragState.startOrder[index];
                if (childMap.get(key)?.disabled) continue;
                swap(newOrder, currentPos, index);
                currentPos = index;
              }
              return newOrder;
            });
            setIsAnimating(true);
            setTimeout(() => setIsAnimating(false), animationDuration);
          }}
          onDragEnd={handleDragEnd}
          onTouchMove={(event) => {
            if (!dragState) return;
            const { clientX, screenX, clientY, screenY } = event.touches[0];
            const left = clientX < scrollThreshold.x ? -5 : innerWidth - screenX < scrollThreshold.x ? 5 : 0;
            const top = clientY < scrollThreshold.y ? -10 : innerHeight - screenY < scrollThreshold.y ? 10 : 0;
            setScroll(left || top ? { left, top } : undefined);
          }}
          onTouchEnd={() => setScroll(undefined)}
        >
          {child}
        </ReorderItem>
      );
    });
  }, [childMap, order, dragState, isAnimating, useOnlyIconToDrag, selectedItemOpacity, animationDuration]);

  function getRef(key: Key) {
    if (!itemRefs.current.has(key)) itemRefs.current.set(key, createRef());
    return itemRefs.current.get(key)!;
  }

  function handleDragEnd(event: DragEvent | null) {
    if (event) {
      event.stopPropagation();
      if (dragState && dragState.currentIndex !== dragState.startIndex) onPositionChange?.({ start: dragState.startIndex, end: dragState.currentIndex, oldOrder: dragState.startOrder, newOrder: order, revert: () => setOrder(dragState.startOrder) });
    }
    setDragState(undefined);
    setScroll(undefined);
  }

  useEffect(() => {
    const currentKeys: Order = [];
    Children.forEach(children, (child) => {
      const { key } = child as JSX.Element;
      if (key) currentKeys.push(key);
    });

    let newOrder: Order;
    if (preserveOrder) {
      const currentKeySet = new Set(currentKeys);
      const newKeys = currentKeys.filter((key) => !order.includes(key));
      const filteredOrder = order.filter((key) => currentKeySet.has(key));
      newOrder = [...filteredOrder, ...newKeys];
    } else newOrder = currentKeys;

    if (!areOrdersEqual(order, newOrder)) {
      if (dragState) setDragState(undefined);
      setOrder(newOrder);
    }
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
    <div ref={containerRef} {...props}>
      {disabled ? children : <Animation duration={dragState && !scroll ? animationDuration : 0}>{orderedChildren}</Animation>}
    </div>
  );
}
