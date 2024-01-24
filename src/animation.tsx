import React, { useState, useLayoutEffect, ReactNode, Children, useEffect, useRef } from "react";

type AnimationProps = { duration: number, children: ReactNode }

type BoundingBox = { [key: string]: DOMRect }

function usePrevious<T>(value: T): T | undefined {
    const prevChildrenRef = useRef<T>();
    useEffect(() => { prevChildrenRef.current = value; }, [value]);
    return prevChildrenRef.current;
};

function calculateBoundingBoxes(children: ReactNode) {
    const boundingBoxes: BoundingBox = {};
    Children.forEach(children, child => boundingBoxes[((child as any).key as string).split("/.")[0]] = ((child as any).ref.current as HTMLElement).getBoundingClientRect());
    return boundingBoxes;
};

function Animate({ duration, children }: AnimationProps) {
    const [boundingBox, setBoundingBox] = useState<BoundingBox>({});
    const prevBoundingBox = usePrevious(boundingBox)

    useLayoutEffect(() => {
        const newBoundingBox = calculateBoundingBoxes(children);
        setBoundingBox(newBoundingBox);
    }, [children]);

    useLayoutEffect(() => {
        if (prevBoundingBox && Object.keys(prevBoundingBox).length) Children.forEach(children, child => {
            const domNode: HTMLElement = (child as any).ref.current;
            const key = ((child as any).key as string).split("/.")[0]
            const { left: prevLeft, top: prevTop }: DOMRect = prevBoundingBox[key] || {};
            const { left, top }: DOMRect = boundingBox[key];
            const changeInX = prevLeft - left, changeInY = prevTop - top;
            if (changeInX || changeInY) requestAnimationFrame(() => {
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
};

export default function Animation({ duration, children }: AnimationProps) {
    return duration > 0 ? <Animate duration={duration}>{children}</Animate> : children
}