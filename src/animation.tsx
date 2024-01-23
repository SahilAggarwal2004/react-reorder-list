import React, { useState, useLayoutEffect, ReactNode, Children, isValidElement, useEffect, useRef } from "react";

type AnimationProps = { duration: number, children: ReactNode }

type BoundingBox = { [key: string]: DOMRect }

function usePrevious<T>(value: T): T | undefined {
    const prevChildrenRef = useRef<T>();
    useEffect(() => { prevChildrenRef.current = value; }, [value]);
    return prevChildrenRef.current;
};

function calculateBoundingBoxes(children: ReactNode) {
    const boundingBoxes: BoundingBox = {};
    Children.forEach((children as ReactNode[]), (child, i) => {
        // @ts-ignore
        if (isValidElement(child)) boundingBoxes[child.key || i] = (child.ref.current as HTMLElement).getBoundingClientRect();
    });
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
        if (prevBoundingBox && Object.keys(prevBoundingBox).length) Children.forEach((children as ReactNode[]), (child, i) => {
            if (!isValidElement(child)) return
            // @ts-ignore
            const domNode: HTMLElement = child.ref.current;
            const { left: prevLeft, top: prevTop }: DOMRect = prevBoundingBox[child.key || i];
            const { left, top }: DOMRect = boundingBox[child.key || i];
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
    return duration ? <Animate duration={duration}>{children}</Animate> : children
}