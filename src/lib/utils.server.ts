export function isTuple<T extends any>(array: T[]): array is [T, ...T[]] {
  return Array.isArray(array);
}
