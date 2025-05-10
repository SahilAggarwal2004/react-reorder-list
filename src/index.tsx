import React, { CSSProperties, Children, DetailedHTMLProps, DragEvent, DragEventHandler, HTMLAttributes, JSX, ReactNode, RefObject, TouchEventHandler, cloneElement, createRef, isValidElement, useEffect, useMemo, useRef, useState } from "react";
import Animation from "./animation.js";
import { scrollThreshold } from "./constants.js";
import { useDraggable } from "./hooks.js";
import { PiDotsSixVerticalBold } from "./icons.js";
import { swap } from "./utils.js";

// @ts-ignore
if (typeof window !== "undefined") import("drag-drop-touch");

export type Props = DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>;

export type PositionChangeHandler = (event: { start: number; end: number; oldItems: ReactNode[]; newItems: ReactNode[]; revert: Function }) => void;

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

export type DivDragEventHandler = DragEventHandler<HTMLDivElement>;

export type DivTouchEventHandler = TouchEventHandler<HTMLDivElement>;

export type ReorderItemProps = {
  useOnlyIconToDrag: boolean;
  disable: boolean;
  ref: RefObject<HTMLDivElement | null>;
  style: CSSProperties;
  onDragStart?: DivDragEventHandler;
  onDragEnter: DivDragEventHandler;
  onDragEnd: DivDragEventHandler;
  onTouchMove: DivTouchEventHandler;
  onTouchEnd: DivTouchEventHandler;
  children: ReactNode;
};

export type { IconProps } from "./icons.js";

export function ReorderIcon({ children = <PiDotsSixVerticalBold />, style, ...props }: Props) {
  return (
    <span style={{ cursor: "grab", ...style }} {...props}>
      {children}
    </span>
  );
}

function ReorderItem({ useOnlyIconToDrag, disable, ref, style, children, onTouchEnd: propOnTouchEnd, ...events }: ReorderItemProps) {
  const [draggable, { onTouchEnd: draggableOnTouchEnd, ...draggableProps }] = useDraggable();
  if (!draggable) events.onDragStart = undefined;
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
      style={style}
      {...(!disable && {
        ...events,
        ...(!useOnlyIconToDrag && draggableProps),
        onTouchEnd: (event) => {
          draggableOnTouchEnd();
          propOnTouchEnd(event);
        },
      })}
    >
      {recursiveChildren}
    </div>
  );
}

export default function ReorderList({ useOnlyIconToDrag = false, selectedItemOpacity = 0.5, animationDuration = 400, watchChildrenUpdates = false, preserveOrder = false, onPositionChange, disabled = false, props, children }: ReorderListProps) {
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
        [[], []]
      ),
    [items]
  );

  const findIndex = (key: string | null) => (key ? items.findIndex((item) => (item as JSX.Element)?.key?.split(".$").at(-1) === key) : -1);

  useEffect(() => {
    if (!watchChildrenUpdates) return;
    if (selected !== -1) handleDragEnd(null, selected, preserveOrder);
    if (preserveOrder) {
      const items: ReactNode[] = [];
      const newItems: ReactNode[] = [];
      Children.forEach(children, (child) => {
        const index = findIndex((child as JSX.Element)?.key);
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
    if (handlePositionChange && end !== start) onPositionChange?.({ start, end, oldItems: temp.items, newItems: items, revert: () => setItems(temp.items) });
    setStart(-1);
    setSelected(-1);
  }

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
                style={{ opacity: selected === i ? selectedItemOpacity : 1, touchAction: "pan-y" }}
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
