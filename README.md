# react-reorder-list

A simple react component that facilitates the reordering of JSX/HTML elements through drag-and-drop functionality, allowing for easy position changes.

## Features

- Reorders list of elements using drag and drop
- Easy to use
- Smooth transition using animation
- Automatically syncs with children updates
- Preserves user's custom order when children change
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
import React from "react";
import ReorderList, { ReorderIcon } from "react-reorder-list";

export default function App() {
  return (
    <ReorderList useOnlyIconToDrag={true}>
      {[0, 1, 2, 3, 4].map((i) => {
        return (
          <div key={i}>
            <ReorderIcon /> {/* Default icon */}
            <ReorderIcon>{/* Custom icon/component */}</ReorderIcon>
            <span>{i}</span>
          </div>
        );
      })}
    </ReorderList>
  );
}
```

#### Handling Children Updates

`<ReorderList>` automatically syncs with updates to its children components. When the children change (e.g., items added/removed, or state updates), the component intelligently handles the update based on the `preserveOrder` prop.

**With `preserveOrder={true}` (default):**

- The user's custom reorder is preserved
- New items are added at the end
- Removed items are cleanly removed
- Any in-progress drag is cancelled to prevent inconsistencies

**With `preserveOrder={false}:`**

- The order resets to match the new children order
- User's custom ordering is discarded
- Useful for server-controlled or filtered lists

```jsx
import React, { useState } from "react";
import ReorderList from "react-reorder-list";

export default function App() {
  const [array, setArray] = useState([0, 1, 2, 3, 4]);

  function addItem() {
    setArray((prev) => [...prev, Math.max(...prev) + 1]);
  }

  function removeItem() {
    setArray((prev) => prev.slice(0, -1));
  }

  return (
    <div>
      <ReorderList preserveOrder={true} animationDuration={200}>
        {array.map((i) => (
          <div key={i}>Item {i}</div>
        ))}
      </ReorderList>
      <button onClick={addItem}>Add Item</button>
      <button onClick={removeItem}>Remove Item</button>
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

## API Reference

### ReorderList Component

Here is the full API for the `<ReorderList>` component, these properties can be set on an instance of ReorderList:

| Parameter             | Type                                              | Required | Default | Description                                                                                                                                                          |
| --------------------- | ------------------------------------------------- | -------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `useOnlyIconToDrag`   | `boolean`                                         | No       | false   | See [usage with ReorderIcon](#usage-with-reordericon)                                                                                                                |
| `selectedItemOpacity` | `number (0 to 1)`                                 | No       | 0.5     | This determines the opacity of the item being dragged, until released.                                                                                               |
| `animationDuration`   | `number`                                          | No       | 300     | The duration (in ms) of swapping animation between items. If set to 0, animation will be disabled.                                                                   |
| `preserveOrder`       | `boolean`                                         | No       | true    | When true, preserves user's custom order when children update. When false, resets to new children order. See [handling children updates](#handling-children-updates) |
| `onPositionChange`    | [`PositionChangeHandler`](#positionchangehandler) | No       | -       | Function to be executed on item position change.                                                                                                                     |
| `disabled`            | `boolean`                                         | No       | false   | When set to true, `<ReorderList>` will work as a plain `div` with no functionality.                                                                                  |
| `props`               | [`DivProps`](#divprops)                           | No       | -       | Props to customize the `<ReorderList>` component.                                                                                                                    |

## Types

### DivProps

```typescript
import type { DetailedHTMLProps, HTMLAttributes } from "react";

type DivProps = DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
```

### PositionChangeHandler

```typescript
import type { Key } from "react";

type Order = Key[];
type RevertHandler = () => void;

export type PositionChangeHandler = (event: {
  start: number; // Index of the item being dragged
  end: number; // Index where the item was dropped
  oldOrder: Order; // Array of keys before reordering
  newOrder: Order; // Array of keys after reordering
  revert: RevertHandler; // A fallback handler to revert the reordering
}) => void;
```

## License

This project is licensed under the [MIT License](LICENSE).
