import React, { CSSProperties, Children, DetailedHTMLProps, DragEventHandler, ForwardedRef, HTMLAttributes, PointerEventHandler, ReactNode, cloneElement, createRef, forwardRef, isValidElement, useEffect, useMemo, useRef, useState } from "react"
import { PiDotsSixVerticalBold } from "./icons.js"
import Animation from "./animation.js"

export type Props = DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>

export type PositionChangeHandler = (params?: { start?: number, end?: number, oldItems?: ReactNode, newItems?: ReactNode }) => void

export type ReorderListProps = { useOnlyIconToDrag?: boolean, selectedItemOpacity?: number, animationDuration?: number, watchChildrenUpdates: boolean, onPositionChange?: PositionChangeHandler, disabled?: boolean, props?: Props, children?: ReactNode }

type DragEvent = DragEventHandler<HTMLDivElement>

type PointerEvent = PointerEventHandler<HTMLDivElement>

type ReorderItemProps = { useOnlyIconToDrag: boolean, style: CSSProperties, onDragStart: DragEvent, onDragEnter: DragEvent, onDragEnd: DragEvent, children: ReactNode }

export type { IconProps } from './icons.js'

const ReorderItemRef = forwardRef(ReorderItem)

export default function ReorderList({ useOnlyIconToDrag = false, selectedItemOpacity = 0.5, animationDuration = 400, watchChildrenUpdates = false, onPositionChange, disabled = false, props, children }: ReorderListProps) {
    const ref = useRef<HTMLDivElement>(null)
    const [start, setStart] = useState(-1)
    const [selected, setSelected] = useState(-1)
    const [items, setItems] = useState<ReactNode[]>(Children.toArray(children))
    const [temp, setTemp] = useState<{ items?: ReactNode[], rect?: DOMRect }>({})
    const [isAnimating, setIsAnimating] = useState(false)
    const refs = useMemo(() => items.map(_ => createRef<HTMLDivElement>()), [items])

    const findIndex = (key: string | undefined) => key ? items.findIndex(item => ((item as JSX.Element)?.key?.split(".$").at(-1) ?? item?.toString()) === key) : -1

    useEffect(() => {
        if (!watchChildrenUpdates) return
        if (selected !== -1) handleDragEnd(selected)
        const items: ReactNode[] = []
        const newItems: ReactNode[] = []
        Children.forEach(children, child => {
            const index = findIndex((child as JSX.Element)?.key ?? child?.toString())
            if (index === -1) newItems.push(child)
            else items[index] = child
        })
        setItems(items.filter(item => item !== undefined).concat(newItems))
    }, [children])

    function handleDragEnd(end: number) {
        if (end !== start) onPositionChange?.({ start, end, oldItems: temp.items, newItems: items })
        setStart(-1)
        setSelected(-1)
    }

    return <div ref={ref} {...props}>
        {disabled ? children : <Animation duration={+(start !== -1) && animationDuration}>
            {Children.map(items, (child, i) => {
                return <ReorderItemRef
                    key={(child as JSX.Element)?.key ?? child?.toString()}
                    ref={refs[i]}
                    useOnlyIconToDrag={useOnlyIconToDrag}
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
                            const items = temp.items!.filter((_, i) => i !== start)
                            items.splice(i, 0, temp.items![start])
                            return items
                        })
                        setIsAnimating(true)
                        setTimeout(() => setIsAnimating(false), animationDuration)
                    }}
                    onDragEnd={event => {
                        event.stopPropagation()
                        handleDragEnd(i)
                    }}
                >{child}</ReorderItemRef>
            })}
        </Animation>
        }
    </div >
}

function ReorderItem({ useOnlyIconToDrag, style, onDragStart, onDragEnter, onDragEnd, children }: ReorderItemProps, ref: ForwardedRef<HTMLDivElement>) {
    const [draggable, setDraggable] = useState(false)
    const onPointerEnter: PointerEvent = () => setDraggable(true)
    const onPointerLeave: PointerEvent = () => setDraggable(false)
    let props: Props = { draggable, onDragStart, onDragEnter, onDragEnd }
    if (!useOnlyIconToDrag) props = { ...props, onPointerEnter, onPointerLeave }
    const recursiveClone = (children: ReactNode): ReactNode => Children.map(children, child => {
        if (!isValidElement(child)) return child
        const childProps: Props = useOnlyIconToDrag && (child as JSX.Element).type.name === 'ReorderIcon' ? { onPointerEnter, onPointerLeave } : {}
        return cloneElement((child as JSX.Element), { children: recursiveClone(child.props.children), ...childProps })
    })
    const recursiveChildren = useMemo(() => recursiveClone(children), [children])

    return <div ref={ref} style={style} {...props}>{recursiveChildren}</div>;
}

export const ReorderIcon = ({ children = <PiDotsSixVerticalBold />, style, ...props }: Props) => <span style={{ cursor: "grab", ...style }} {...props}>{children}</span>