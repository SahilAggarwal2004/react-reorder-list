# react-reorder-list
A simple react component that facilitates the reordering of JSX/HTML elements through drag-and-drop functionality, allowing for easy position changes.
## Features
- Reorders list of elements using drag and drop.
- Easy to use
- Fully Customizable
- Handles nested lists easily. See [nested list usage](#nested-list-usage)
## Installation
To install react-reorder-list
```bash
  # with npm:
  npm install react-reorder-list --save

  # with yarn:
  yarn add react-reorder-list

  # with pnpm:
  pnpm add react-reorder-list

  # with bun:
  bun add react-reorder-list
```
## Usage
`react-reorder-list` default exports `<ReorderList>` component which encapsulates all the list items as its children.

Items in this list can be reordered by simply dragging an item and dropping it in place of another item.
#### Basic Usage
An item can be dragged by clicking anywhere inside the item.
```jsx
import React from 'react'
import ReorderList from 'react-reorder-list'

export default function App() {
    return <ReorderList>
        {[0, 1, 2, 3, 4].map(i => {
            {/* Having a unique key is important */}
            return <div key={i}>{i}</div>
        })}
    </ReorderList>
}
```
#### Usage with ReorderIcon
An item can be dragged only using the `<ReorderIcon>` present inside the item.
```jsx
import React from 'react'
import ReorderList, { ReorderIcon } from 'react-reorder-list'

export default function App() {
    return <ReorderList useOnlyIconToDrag={true}>
        {[0, 1, 2, 3, 4].map(i => {
            return <div key={i}>
                <ReorderIcon /> {/* Default icon */}
                <ReorderIcon>
                    {/* Custom icon/component */}
                </Reordericon>
                <span>{i}</span>
            </div>
        })}
    </ReorderList>
}
```
#### Nested List Usage
```jsx
import React from 'react'
import ReorderList, { ReorderIcon } from 'react-reorder-list'

export default function App() {
    return <ReorderList>
        {[0, 1, 2].map(i => {
            return <div key={i}>
                <span>{'Parent' + i}</span>
                <ReorderList useOnlyIconToDrag={true}>
                    {[0, 1, 2].map(j => {
                        return <div key={j} style={{ paddingLeft: '16px' }}>
                            <ReorderIcon />
                            <span>{'Child' + i + j}</span>
                        </div>
                    })}
                </ReorderList>
            </div>
        })}
    </ReorderList>
}
```
## ReorderList Component API Reference
Here is the full API for the `<ReorderList>` component, these properties can be set on an instance of ReorderList:
| Parameter | Type | Required | Default | Description |
| - | - | - | - | - |
| `useOnlyIconToDrag` | `Boolean` | No | false | See [usage with ReorderIcon](#usage-with-reordericon) |
| `selectedItemOpacity` | `Number (0 to 1)` | No | 0.5 | This determines the opacity of the item being dragged, until released. |
| `animationDuration` | `Number` | No | 400 | The duration of swapping animation between items. If set to 0, animation will be disabled. |
| `onPositionChange` | [`PositionChangeHandler`](#positionchangehandler) | No | - | Function to be executed on item position change. |
| `disable` | `Boolean` | No | false | When set to true, `ReorderList` will work as a plain `div` with no functionality. |
| `props` | `React.DetailedHTMLProps` | No | - | Props to customize the `<ReorderList>` component. |
### Types
#### PositionChangeHandler
```typescript
import { ReactNode } from 'react';
type PositionChangeHandler = (params?: { start?: number, end?: number, oldItems?: ReactNode, newItems?: ReactNode }) => void
```
## Author
[Sahil Aggarwal](https://www.github.com/SahilAggarwal2004)