import type { CSSProperties, DetailedHTMLProps, DragEventHandler, HTMLAttributes, MouseEventHandler, ReactElement, ReactNode, RefObject, TouchEventHandler } from "react";

// lib/react.ts
export type BoundingBox = { [key: string]: DOMRect };

export type Child = ReactElement<{ ref: RefObject<HTMLElement> }>;

// components.ts
export type AnimationProps = { duration: number; children: ReactNode };

// icons.tsx
export type IconProps = React.DetailedHTMLProps<React.HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>;

// index.tsx
export type DivDragEventHandler = DragEventHandler<HTMLDivElement>;

export type DivMouseEventHandler = MouseEventHandler<HTMLDivElement>;

export type DivProps = DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>;

export type DivTouchEventHandler = TouchEventHandler<HTMLDivElement>;

export type PositionChangeHandler = (event: { start: number; end: number; oldItems: ReactNode[]; newItems: ReactNode[]; revert: Function }) => void;

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

export type ReorderListProps = {
  useOnlyIconToDrag?: boolean;
  selectedItemOpacity?: number;
  animationDuration?: number;
  watchChildrenUpdates?: boolean;
  preserveOrder?: boolean;
  onPositionChange?: PositionChangeHandler;
  disabled?: boolean;
  props?: DivProps;
  children?: ReactNode;
};
