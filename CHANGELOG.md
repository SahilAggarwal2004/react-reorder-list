# Changelog

## [0.8.6](https://github.com/SahilAggarwal2004/react-reorder-list/compare/v0.8.5...v0.8.6) (2026-01-04)

### Chores

* Add release-it for automated versioning and changelog.  ([8a504a5](https://github.com/SahilAggarwal2004/react-reorder-list/commit/8a504a5df9b09ba03442657d7708f97f6fd9dfaf))

### Code Refactoring

* Centralize types in `types.ts` and update exports from package root.  ([b3cd94d](https://github.com/SahilAggarwal2004/react-reorder-list/commit/b3cd94d573dc41e0ce0dfceb40503f0e602975c6))
* Modularize `index.tsx`.  ([1eff4ed](https://github.com/SahilAggarwal2004/react-reorder-list/commit/1eff4edac688741c33f5396117f4fc2563330a0b))

### Build System

* Configure tsup for package bundling.  ([5285cab](https://github.com/SahilAggarwal2004/react-reorder-list/commit/5285cab8139db0880efe4360f15956ba5ba28745))

## 0.8.1 (2024-12-29)

* **refactor:** Replaced `usePrevious` with the new `useStateWithHistory` hook.
* **chore:** Switched from [bun](https://bun.sh) to [pnpm](https://pnpm.io/).

## 0.8.0 (2024-12-06)

* **breaking:** Dropped support for React.js v18 in favor of React.js v19.

## 0.7.2 (2024-04-16)

* **chore:** Switched from [pnpm](https://pnpm.io/) to [bun](https://bun.sh).

## 0.7.0 (2024-03-24)

* **feat:** Added `data-disable-reorder` prop for children of the `<ReorderList>` component. See [usage with data-disable-reorder](https://www.npmjs.com/package/react-reorder-list#disable-reordering-for-individual-children).

## 0.6.7 (2024-03-21)

* **remove:** Support for invalid React elements.

## 0.6.3 (2024-02-05)

* **fix:** Minor scrolling bug occurring on touch devices.

## 0.6.1 (2024-02-03)

* **fix:** Minor bugs.

## 0.6.0 (2024-01-27)

* **feat:** Added support for touch devices.

## 0.5.0 (2024-01-26)

* **feat:** Added `preserveOrder` prop in the `<ReorderList>` component. See [ReorderList Component API Reference](https://www.npmjs.com/package/react-reorder-list#reorderlist-component-api-reference).
* **fix:** A bug where the library would not work in production if `useOnlyIconToDrag` was set to `true`.

## 0.4.0 (2024-01-26)

* **feat:** Added `revert` handler/function in the params of the `onPositionChange` handler. See type [PositionChangeHandler](https://www.npmjs.com/package/react-reorder-list#positionchangehandler).

## 0.3.1 (2024-01-25)

* **chore:** Renamed `disable` prop to `disabled`. See [ReorderList Component API Reference](https://www.npmjs.com/package/react-reorder-list#reorderlist-component-api-reference).
* **fixed:** Minor bugs.

## 0.3.0 (2024-01-24)

* **feat:** Added `watchChildrenUpdates` prop in `<ReorderList>`. See [ReorderList Component API Reference](https://www.npmjs.com/package/react-reorder-list#reorderlist-component-api-reference).
* **improve:** Overall stability.

## 0.2.0 (2024-01-23)

* **feat:** Added `animationDuration` prop in `<ReorderList>` component. See [ReorderList Component API Reference](https://www.npmjs.com/package/react-reorder-list#reorderlist-component-api-reference).
* **chore:** Default value of the `useOnlyIconToDrag` prop to `false`. See [ReorderList Component API Reference](https://www.npmjs.com/package/react-reorder-list#reorderlist-component-api-reference).
* **improve:** Overall stability.

## 0.1.2 (2024-01-21)

* **docs:** Added more details on [usage with ReorderIcon](https://www.npmjs.com/package/react-reorder-list#usage-with-reordericon).
