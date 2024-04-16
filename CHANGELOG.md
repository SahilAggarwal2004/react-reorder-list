# 0.7.2 (16-04-2024)

- **changed:** switched from [pnpm](https://pnpm.io/) to [bun](https://bun.sh/)

## 0.7.0 (24-03-2024)

- **added:** `data-disable-reorder` prop for children of `<ReorderList>` component. See [usage with data-disable-reorder](https://www.npmjs.com/package/react-reorder-list#disable-reordering-for-individual-children)

## 0.6.7 (21-03-2024)

- **removed:** proper support invalid react elements.

## 0.6.3 (05-02-2034)

- **fixed:** minor scrolling bug that was occuring on touch devices.

## 0.6.1 (03-02-2034)

- **fixed:** minor bugs

## 0.6.0 (27-01-2024)

- **added:** support for touch devices

## 0.5.0 (26-01-2024)

- **added:** `preserveOrder` prop in `<ReorderList>` component. See [ReorderList Component API Reference](https://www.npmjs.com/package/react-reorder-list#reorderlist-component-api-reference)
- **fixed:** a bug where library would not work in production if `useOnlyIconToDrag` is set to `true`.

## 0.4.0 (26-01-2024)

- **added:** `revert` handler/function in params of `onPositionChange` handler. See type [PositionChangeHandler](https://www.npmjs.com/package/react-reorder-list#positionchangehandler)

## 0.3.1 (25-01-2024)

- **changed:** `disable` prop to `disabled`. See [ReorderList Component API Reference](https://www.npmjs.com/package/react-reorder-list#reorderlist-component-api-reference)
- **fixed:** minor bugs

## 0.3.0 (24-01-2024)

- **added:** `watchChildrenUpdates` prop in `<ReorderList>`. See [ReorderList Component API Reference](https://www.npmjs.com/package/react-reorder-list#reorderlist-component-api-reference)
- **improved:** overall stability

## 0.2.0 (23-01-2024)

- **added:** `animationDuration` prop in `<ReorderList>` component. See [ReorderList Component API Reference](https://www.npmjs.com/package/react-reorder-list#reorderlist-component-api-reference)
- **changed:** default value of `useOnlyIconToDrag` prop to `false`. See [ReorderList Component API Reference](https://www.npmjs.com/package/react-reorder-list#reorderlist-component-api-reference)
- **improved:** overall stability

## 0.1.2 (21-02-2024)

- **docs:** added more details on [usage with ReorderIcon](https://www.npmjs.com/package/react-reorder-list#usage-with-reordericon)
