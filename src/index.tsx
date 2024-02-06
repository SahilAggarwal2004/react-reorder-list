import React, { CSSProperties, Children, DetailedHTMLProps, DragEvent, DragEventHandler, ForwardedRef, HTMLAttributes, ReactNode, TouchEventHandler, cloneElement, createRef, forwardRef, isValidElement, useEffect, useMemo, useRef, useState } from "react";
import { PiDotsSixVerticalBold } from "./icons.js";
import Animation from "./animation.js";
import { useDraggable } from "./hooks.js";

// @ts-ignore
if (typeof window !== "undefined") import("drag-drop-touch");

export type Props = DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>;

export type PositionChangeHandler = (params?: { start?: number; end?: number; oldItems?: ReactNode[]; newItems?: ReactNode[]; revert?: () => void }) => void;

export type ReorderListProps = {
  useOnlyIconToDrag?: boolean;
  selectedItemOpacity?: number;
  animationDuration?: number;
  watchChildrenUpdates?: boolean;
  preserveOrder?: boolean;
  onPositionChange?: PositionChangeHandler;
  disabled?: boolean;
  props?: Props;
  children?: ReactNode;
};

type DivDragEventHandler = DragEventHandler<HTMLDivElement>;

type DivTouchEventHandler = TouchEventHandler<HTMLDivElement>;

type ReorderItemProps = {
  useOnlyIconToDrag: boolean;
  style: CSSProperties;
  onDragStart?: DivDragEventHandler;
  onDragEnter: DivDragEventHandler;
  onDragEnd: DivDragEventHandler;
  onTouchMove: DivTouchEventHandler;
  onTouchEnd: DivTouchEventHandler;
  children: ReactNode;
};

export type { IconProps } from "./icons.js";

const scrollThreshold = { x: 10, y: 100 };

const ReorderItemRef = forwardRef(ReorderItem);

export default function ReorderList({ useOnlyIconToDrag = false, selectedItemOpacity = 0.5, animationDuration = 400, watchChildrenUpdates = false, preserveOrder = false, onPositionChange, disabled = false, props, children }: ReorderListProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [start, setStart] = useState(-1);
  const [selected, setSelected] = useState(-1);
  const [items, setItems] = useState<ReactNode[]>(Children.toArray(children));
  const [temp, setTemp] = useState<{ items?: ReactNode[]; rect?: DOMRect }>({});
  const [isAnimating, setIsAnimating] = useState(false);
  const [scroll, setScroll] = useState<{ left: number; top: number }>();
  const refs = useMemo(() => items.map((_) => createRef<HTMLDivElement>()), [items]);

  const findIndex = (key: string | undefined) => (key ? items.findIndex((item) => ((item as JSX.Element)?.key?.split(".$").at(-1) ?? item?.toString()) === key) : -1);

  useEffect(() => {
    if (!watchChildrenUpdates) return;
    if (selected !== -1) handleDragEnd(null, selected, preserveOrder);
    if (preserveOrder) {
      const items: ReactNode[] = [];
      const newItems: ReactNode[] = [];
      Children.forEach(children, (child) => {
        const index = findIndex((child as JSX.Element)?.key ?? child?.toString());
        if (index === -1) newItems.push(child);
        else items[index] = child;
      });
      setItems(items.filter((item) => item !== undefined).concat(newItems));
    } else setItems(Children.toArray(children));
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

  function handleDragEnd(event: DragEvent | null, end: number = selected, handlePositionChange: boolean = true) {
    event?.stopPropagation();
    if (handlePositionChange && end !== start) onPositionChange?.({ start, end, oldItems: temp.items, newItems: items, revert: () => setItems(temp.items!) });
    setStart(-1);
    setSelected(-1);
  }

  return (
    <div ref={ref} {...props}>
      {disabled ? (
        children
      ) : (
        <Animation duration={+(start !== -1 && !scroll) && animationDuration}>
          {Children.map(items, (child, i) => {
            return (
              <ReorderItemRef
                key={(child as JSX.Element)?.key ?? child?.toString()}
                ref={refs[i]}
                useOnlyIconToDrag={useOnlyIconToDrag}
                style={{ opacity: selected === i ? selectedItemOpacity : 1, touchAction: "pan-y" }}
                onDragStart={(event) => {
                  event.stopPropagation();
                  setStart(i);
                  setSelected(i);
                  setTemp({ items, rect: ref.current!.children[i].getBoundingClientRect() });
                }}
                onDragEnter={(event) => {
                  event.stopPropagation();
                  if (start === -1 || selected === i || isAnimating) return;
                  const { width: startWidth, height: startHeight } = temp.rect!;
                  const { left, top, width, height } = (event.target as HTMLDivElement).getBoundingClientRect();
                  if (event.clientX - left > Math.min(startWidth, width) || event.clientY - top > Math.min(startHeight, height)) return;
                  setSelected(i);
                  setItems(() => {
                    const items = temp.items!.filter((_, i) => i !== start);
                    items.splice(i, 0, temp.items![start]);
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
              </ReorderItemRef>
            );
          })}
        </Animation>
      )}
    </div>
  );
}

function ReorderItem({ useOnlyIconToDrag, onTouchEnd: propOnTouchEnd, children, ...props }: ReorderItemProps, ref: ForwardedRef<HTMLDivElement>) {
  const {
    draggable,
    draggableProps: { onTouchEnd: draggableOnTouchEnd, ...draggableProps },
  } = useDraggable();
  if (!draggable) props.onDragStart = undefined;
  const recursiveClone = (children: ReactNode): ReactNode =>
    Children.map(children, (child) => {
      if (!isValidElement(child)) return child;
      return cloneElement(child, child.type === ReorderIcon ? draggableProps : {}, recursiveClone((child as JSX.Element).props.children));
    });
  const recursiveChildren = useMemo(() => (useOnlyIconToDrag ? recursiveClone(children) : children), [useOnlyIconToDrag, children]);

  return (
    <div
      ref={ref}
      draggable={draggable}
      {...props}
      {...(!useOnlyIconToDrag && draggableProps)}
      onTouchEnd={(event) => {
        draggableOnTouchEnd();
        propOnTouchEnd(event);
      }}
    >
      {recursiveChildren}
    </div>
  );
}

export function ReorderIcon({ children = <PiDotsSixVerticalBold />, style, ...props }: Props) {
  return (
    <span style={{ cursor: "grab", ...style }} {...props}>
      {children}
    </span>
  );
}
