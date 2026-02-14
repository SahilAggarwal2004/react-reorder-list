import type { CSSProperties, DetailedHTMLProps, DragEventHandler, HTMLAttributes, Key, MouseEventHandler, ReactElement, ReactNode, RefObject, TouchEventHandler } from "react";

// lib/react.ts
export type AnimationProps = { duration: number; children: Child[] };

export type BoundingBox = Record<string, DOMRect>;

export type Child = ReactElement<{ ref: RefObject<HTMLElement> }>;

// lib/utils.ts
export type Order = Key[];

// components.ts
export type DivDragEventHandler = DragEventHandler<HTMLDivElement>;

export type DivMouseEventHandler = MouseEventHandler<HTMLDivElement>;

export type DivProps = DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>;

export type DivRef = RefObject<HTMLDivElement | null>;

export type DivTouchEventHandler = TouchEventHandler<HTMLDivElement>;

export type PositionChangeHandler = (event: { start: number; end: number; oldOrder: Order; newOrder: Order; revert: RevertHandler }) => void;

export type ReorderItemProps = {
  useOnlyIconToDrag: boolean;
  disable?: boolean;
  ref: DivRef;
  style: CSSProperties;
  onDragStart?: DivDragEventHandler;
  onDragEnter: DivDragEventHandler;
  onDragEnd: DivDragEventHandler;
  onTouchMove: DivTouchEventHandler;
  onTouchEnd: DivTouchEventHandler;
  children: ReactNode;
};

export type ReorderListProps = {
  useOnlyIconToDrag?: boolean;
  selectedItemOpacity?: number;
  animationDuration?: number;
  preserveOrder?: boolean;
  onPositionChange?: PositionChangeHandler;
  disabled?: boolean;
  props?: DivProps;
  children?: ReactNode;
};

export type RevertHandler = () => void;

// icons.tsx
export type IconProps = React.DetailedHTMLProps<React.HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>;
