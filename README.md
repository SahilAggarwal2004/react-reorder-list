# react-reorder-list

A simple react component that facilitates the reordering of JSX/HTML elements through drag-and-drop functionality, allowing for easy position changes.

## Features

- Reorders list of elements using drag and drop.
- Easy to use
- Smooth transition using animation.
- Listens to children updates. See [listen to children updates](#listen-to-children-updates)
- Disables reordering for individual children. See [disable reordering for individual children](#disable-reordering-for-individual-children)
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

Each `<div>` component inside `<ReorderList>` can now be drag-and-dropped to another `<div>` to reorder them.

```jsx
import React from "react";
import ReorderList from "react-reorder-list";

export default function App() {
  return (
    <ReorderList>
      {[0, 1, 2, 3, 4].map((i) => {
        return <div key={i}>Item {i}</div>; // Having a unique key is important
      })}
    </ReorderList>
  );
}
```

#### Usage with ReorderIcon

The dragging behavior can be changed using the `useOnlyIconToDrag` prop of `<ReorderList>` component.

If set to `false`, an item can be dragged by clicking anywhere inside the item.

If set to `true`, an item can be dragged only using the `<ReorderIcon>` present inside the item.

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

#### Listen to Children Updates

`<ReorderList>` can listen to updates to it's children components using the `watchChildrenUpdates` prop as shown below.

If set to `false`, any updates made in children component except reordering by user won't reflect.

If set to `true`, updates to children like state changes, additions/omissions of children components will reflect in real time.<br>
Further if `preserveOrder` is set to false, the order in which new children appear will be maintained.<br>
Whereas if `preserveOrder` is set to true, the order of existing items will be preserved as before the update occured and new items will be placed at the end irrespective of their order in children. Also, if an item is being dragged and an update occurs at that moment, that item will be placed at respective location and `onPositionChange` will be called to prevent any inconsistency.

NOTE: The props `watchChildrenUpdates` and `preserveOrder` should be used carefully to avoid any unexpected behaviour

```jsx
import React, { useState } from "react";
import ReorderList from "react-reorder-list";

export default function App() {
  const [array, setArray] = useState([0, 1, 2, 3, 4]);

  function setNewArray() {
    setArray((prev) => {
      const array = [];
      prev.forEach((_) => {
        do {
          var item = Math.floor(Math.random() * 9);
        } while (array.includes(item));
        array.push(item);
      });
      return array;
    });
  }

  return (
    <div>
      <ReorderList watchChildrenUpdates={true} animationDuration={200}>
        {array.map((i) => (
          <div key={i}>Item {i}</div>
        ))}
      </ReorderList>
      <button onClick={setNewArray}>Click me</button>
    </div>
  );
}
```

#### Disable reordering for individual children

```jsx
import React from "react";
import ReorderList from "react-reorder-list";

export default function App() {
  return (
    <ReorderList>
      <div key="div" data-disable-reorder={true}>
        This div cannot be reordered
      </div>
      {[0, 1, 2, 3, 4].map((i) => {
        return <div key={i}>Item {i}</div>; // Having a unique key is important
      })}
      <p key="p" data-disable-reorder={true}>
        This p cannot be reordered either
      </p>
    </ReorderList>
  );
}
```

#### Nested List Usage

```jsx
import React from "react";
import ReorderList, { ReorderIcon } from "react-reorder-list";

export default function App() {
  return (
    <ReorderList>
      {[0, 1, 2].map((i) => {
        return (
          <div key={i}>
            <ReorderIcon />
            <span>{"Parent" + i}</span>
            <ReorderList useOnlyIconToDrag={true}>
              {[0, 1, 2].map((j) => {
                return (
                  <div key={j} style={{ paddingLeft: "16px" }}>
                    <ReorderIcon />
                    <span>{"Child" + i + j}</span>
                  </div>
                );
              })}
            </ReorderList>
          </div>
        );
      })}
    </ReorderList>
  );
}
```

## ReorderList Component API Reference

Here is the full API for the `<ReorderList>` component, these properties can be set on an instance of ReorderList:
| Parameter | Type | Required | Default | Description |
| - | - | - | - | - |
| `useOnlyIconToDrag` | `boolean` | No | false | See [usage with ReorderIcon](#usage-with-reordericon) |
| `selectedItemOpacity` | `number (0 to 1)` | No | 0.5 | This determines the opacity of the item being dragged, until released. |
| `animationDuration` | `number` | No | 400 | The duration (in ms) of swapping animation between items. If set to 0, animation will be disabled. |
| `watchChildrenUpdates` | `boolean` | No | false | Enable this to listen to any updates in children of `<ReorderList>` and update the state accordingly. See [listen to children updates](#listen-to-children-updates) |
| `preserveOrder` | `boolean` | No | false | Works along woth `watchChildrenUpdates` to determine whether to preserve existing order or not. See [listen to children updates](#listen-to-children-updates) |
| `onPositionChange` | [`PositionChangeHandler`](#positionchangehandler) | No | - | Function to be executed on item position change. |
| `disabled` | `boolean` | No | false | When set to true, `<ReorderList>` will work as a plain `div` with no functionality. |
| `props` | `React.DetailedHTMLProps` | No | - | Props to customize the `<ReorderList>` component. |

### Types

#### PositionChangeHandler

```typescript
import { ReactNode } from "react";
type RevertHandler = () => void;
type PositionChangeParams = {
  start?: number; // Index of the item being dragged
  end?: number; // Index of the item being displaced by the starting item
  oldItems?: ReactNode[]; // Array of children before reordering
  newItems?: ReactNode[]; // Array of children after reordering
  revert: RevertHandler; // A fallback handler to revert the reordering
};
type PositionChangeHandler = (params?: PositionChangeParams) => void;
```

## License

This project is licensed under the [MIT License](LICENSE).
