# 0.8.1 (29-12-2024)

- **refactor:** Replaced `usePrevious` with the new `useStateWithHistory` hook.
- **chore:** Switched from [bun](https://bun.sh) to [pnpm](https://pnpm.io/).

## 0.8.0 (06-12-2024)

- **breaking:** Dropped support for React.js v18 in favor of React.js v19.

## 0.7.2 (16-04-2024)

- **chore:** Switched from [pnpm](https://pnpm.io/) to [bun](https://bun.sh).

## 0.7.0 (24-03-2024)

- **feat:** Added `data-disable-reorder` prop for children of the `<ReorderList>` component. See [usage with data-disable-reorder](https://www.npmjs.com/package/react-reorder-list#disable-reordering-for-individual-children).

## 0.6.7 (21-03-2024)

- **remove:** Support for invalid React elements.

## 0.6.3 (05-02-2024)

- **fix:** Minor scrolling bug occurring on touch devices.

## 0.6.1 (03-02-2024)

- **fix:** Minor bugs.

## 0.6.0 (27-01-2024)

- **feat:** Added support for touch devices.

## 0.5.0 (26-01-2024)

- **feat:** Added `preserveOrder` prop in the `<ReorderList>` component. See [ReorderList Component API Reference](https://www.npmjs.com/package/react-reorder-list#reorderlist-component-api-reference).
- **fix:** A bug where the library would not work in production if `useOnlyIconToDrag` was set to `true`.

## 0.4.0 (26-01-2024)

- **feat:** Added `revert` handler/function in the params of the `onPositionChange` handler. See type [PositionChangeHandler](https://www.npmjs.com/package/react-reorder-list#positionchangehandler).

## 0.3.1 (25-01-2024)

- **chore:** Renamed `disable` prop to `disabled`. See [ReorderList Component API Reference](https://www.npmjs.com/package/react-reorder-list#reorderlist-component-api-reference).
- **fixed:** Minor bugs.

## 0.3.0 (24-01-2024)

- **feat:** Added `watchChildrenUpdates` prop in `<ReorderList>`. See [ReorderList Component API Reference](https://www.npmjs.com/package/react-reorder-list#reorderlist-component-api-reference).
- **improve:** Overall stability.

## 0.2.0 (23-01-2024)

- **feat:** Added `animationDuration` prop in `<ReorderList>` component. See [ReorderList Component API Reference](https://www.npmjs.com/package/react-reorder-list#reorderlist-component-api-reference).
- **chore:** Default value of the `useOnlyIconToDrag` prop to `false`. See [ReorderList Component API Reference](https://www.npmjs.com/package/react-reorder-list#reorderlist-component-api-reference).
- **improve:** Overall stability.

## 0.1.2 (21-01-2024)

- **docs:** Added more details on [usage with ReorderIcon](https://www.npmjs.com/package/react-reorder-list#usage-with-reordericon).
