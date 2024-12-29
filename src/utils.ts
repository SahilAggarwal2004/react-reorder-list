import { JSX, ReactNode } from "react";

export const getKey = (child: ReactNode) => (child as JSX.Element)?.key?.split("/.")[0];

export function swap(array: any[], i: number, j: number) {
  const temp = array[i];
  array[i] = array[j];
  array[j] = temp;
}
