import React, { CSSProperties, Children, DetailedHTMLProps, DragEventHandler, HTMLAttributes, LegacyRef, PointerEventHandler, ReactNode, cloneElement, createRef, forwardRef, isValidElement, useMemo, useRef, useState } from 'react'
import { PiDotsSixVerticalBold } from './icons.js'
import Animation from './animation.js'

export type Props = DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>

export type PositionChangeHandler = (params?: { start?: number, end?: number, oldItems?: ReactNode, newItems?: ReactNode }) => void

export type ReorderListProps = { useOnlyIconToDrag?: boolean, selectedItemOpacity?: number, animationDuration?: number, onPositionChange?: PositionChangeHandler, disable?: boolean, props?: Props, children?: ReactNode }

type DragEvent = DragEventHandler<HTMLDivElement>

type PointerEvent = PointerEventHandler<HTMLDivElement>

type ReorderItemProps = { useOnlyIconToDrag: boolean, draggable: boolean, style: CSSProperties, onDragStart: DragEvent, onDragEnter: DragEvent, onDragEnd: DragEvent, onPointerEnter: PointerEvent, onPointerLeave: PointerEvent, children: ReactNode }

export type { IconProps } from './icons.js'

const ReorderItem = forwardRef(({ useOnlyIconToDrag, draggable, style, onDragStart, onDragEnter, onDragEnd, onPointerEnter, onPointerLeave, children }: ReorderItemProps, ref) => {
    const props = draggable ? { draggable, onDragStart, onDragEnter, onDragEnd } : {}
    const recursiveClone = (children: ReactNode): ReactNode => Children.map(children, child => {
        if (!isValidElement(child)) return child
        const childProps: { onPointerEnter?: PointerEvent, onPointerLeave?: PointerEvent } = {}
        if (useOnlyIconToDrag && (child as JSX.Element).type.name === 'ReorderIcon') {
            childProps.onPointerEnter = onPointerEnter
            childProps.onPointerLeave = onPointerLeave
        }
        return cloneElement((child as JSX.Element), { children: recursiveClone(child.props.children), ...childProps })
    })
    const recursiveChildren = useMemo(() => recursiveClone(children), [children])

    return <div ref={ref as LegacyRef<HTMLDivElement>} style={style} {...props}>{recursiveChildren}</div>;
})

export default function ReorderList({ useOnlyIconToDrag = false, selectedItemOpacity = 0.5, animationDuration = 400, onPositionChange, disable = false, props, children }: ReorderListProps) {
    const ref = useRef<HTMLDivElement>()
    const [draggable, setDraggable] = useState(!useOnlyIconToDrag)
    const [start, setStart] = useState(-1)
    const [selected, setSelected] = useState(-1)
    const [items, setItems] = useState<ReactNode>(children)
    const [temp, setTemp] = useState<{ items?: ReactNode, rect?: DOMRect }>({})
    const [isAnimating, setIsAnimating] = useState(false)

    return <div ref={ref as LegacyRef<HTMLDivElement>} {...props}>
        {disable ? children : <Animation duration={+draggable && animationDuration}>
            {Children.map(items, (child, i) => {
                if (!isValidElement(child)) return child
                return <ReorderItem
                    key={child.key || i}
                    ref={createRef()}
                    useOnlyIconToDrag={useOnlyIconToDrag}
                    draggable={draggable}
                    style={{ opacity: selected === i ? selectedItemOpacity : 1 }}
                    onDragStart={event => {
                        event.stopPropagation()
                        setStart(i)
                        setSelected(i)
                        setTemp({ items, rect: ref.current!.children[i].getBoundingClientRect() })
                    }}
                    onDragEnter={event => {
                        event.stopPropagation()
                        if (start === -1 || selected === i || isAnimating) return
                        const { width: startWidth, height: startHeight } = temp.rect!
                        const { left, top, width, height } = event.currentTarget.getBoundingClientRect()
                        if (event.clientX - left > Math.min(startWidth, width) || event.clientY - top > Math.min(startHeight, height)) return
                        setSelected(i)
                        setItems(() => {
                            const items = (temp.items as ReactNode[]).filter((_, i) => i !== start)
                            items.splice(i, 0, (temp.items as ReactNode[])[start])
                            return items
                        })
                        setIsAnimating(true)
                        setTimeout(() => setIsAnimating(false), animationDuration)
                    }}
                    onDragEnd={event => {
                        event.stopPropagation()
                        if (i !== start) onPositionChange?.({ start, end: i, oldItems: temp.items, newItems: items })
                        setStart(-1)
                        setSelected(-1)
                    }}
                    onPointerEnter={() => setDraggable(true)}
                    onPointerLeave={() => setDraggable(false)}
                >{child}</ReorderItem>
            })}
        </Animation>
        }
    </div >
}

export const ReorderIcon = ({ children = <PiDotsSixVerticalBold />, style, ...props }: Props) => <span style={{ cursor: "grab", ...style }} {...props}>{children}</span>