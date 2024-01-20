import React, { Children, DetailedHTMLProps, DragEventHandler, HTMLAttributes, PointerEventHandler, ReactNode, cloneElement, isValidElement, useMemo, useState } from 'react'
import { PiDotsSixVerticalBold } from './icons.js'

export type Props = DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>

export type PositionChangeHandler = (params?: { start?: number, end?: number, oldItems?: ReactNode, newItems?: ReactNode }) => void

export type ReorderListProps = { useOnlyIconToDrag?: boolean, selectedItemOpacity?: number, onPositionChange?: PositionChangeHandler, disable?: boolean, props?: Props, children?: ReactNode }

type DragEvent = DragEventHandler<HTMLDivElement>

type ReorderItemProps = { useOnlyIconToDrag: boolean, opacity: number, onDragStart: DragEvent, onDragEnter: DragEvent, onDragEnd: DragEvent, children: ReactNode }

type PointerEvent = PointerEventHandler<HTMLDivElement>

export type { IconProps } from './icons.js'

export default function ReorderList({ useOnlyIconToDrag = true, selectedItemOpacity = 0.5, onPositionChange, disable = false, props, children }: ReorderListProps) {
    const [start, setStart] = useState(-1)
    const [selected, setSelected] = useState(-1)
    const [items, setItems] = useState<ReactNode>(children)
    const [temp, setTemp] = useState<ReactNode[]>([])

    return <div {...props}>
        {disable ? children : Children.map(items, (child, i) => {
            if (!isValidElement(child)) return child
            return <ReorderItem
                key={child.key || i}
                opacity={selected === i ? selectedItemOpacity : 1}
                useOnlyIconToDrag={useOnlyIconToDrag}
                onDragStart={event => {
                    event.stopPropagation()
                    setStart(i)
                    setSelected(i)
                    setTemp(items as ReactNode[])
                }}
                onDragEnter={event => {
                    event.stopPropagation()
                    if (start === -1) return
                    setSelected(i)
                    setItems(() => {
                        const items = temp.filter((_, i) => i !== start)
                        items.splice(i, 0, temp[start])
                        return items
                    })
                }}
                onDragEnd={event => {
                    event.stopPropagation()
                    if (i !== start) onPositionChange?.({ start, end: i, oldItems: temp, newItems: items })
                    setStart(-1)
                    setSelected(-1)
                }}
            >{child}</ReorderItem>
        })}
    </div >
}

function ReorderItem({ useOnlyIconToDrag, opacity, onDragStart, onDragEnter, onDragEnd, children }: ReorderItemProps) {
    const [draggable, setDraggable] = useState(!useOnlyIconToDrag)
    const recursiveChildren = useMemo(() => recursiveClone(children), [children])

    function recursiveClone(children: ReactNode): ReactNode {
        return Children.map(children, child => {
            if (!isValidElement(child)) return child
            const childProps: { onPointerEnter?: PointerEvent, onPointerLeave?: PointerEvent } = {}
            if (useOnlyIconToDrag && (child as JSX.Element).type.name === 'ReorderIcon') {
                childProps.onPointerEnter = () => setDraggable(true)
                childProps.onPointerLeave = () => setDraggable(false)
            }
            return cloneElement((child as JSX.Element), { children: recursiveClone(child.props.children), ...childProps })
        })
    }

    return <div draggable={draggable} onDragStart={onDragStart} onDragEnter={onDragEnter} onDragEnd={onDragEnd} style={{ opacity }}>{recursiveChildren}</div>;
}

export const ReorderIcon = ({ children = <PiDotsSixVerticalBold />, style, ...props }: Props) => <span style={{ cursor: "grab", ...style }} {...props}>{children}</span>