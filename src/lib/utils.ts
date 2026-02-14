import { Order } from "../types";

export const areOrdersEqual = (a: Order, b: Order) => a.length === b.length && a.every((key, index) => key === b[index]);

export function swap(array: any[], i: number, j: number) {
  const temp = array[i];
  array[i] = array[j];
  array[j] = temp;
}
