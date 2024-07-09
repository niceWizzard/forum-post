export function isTuple<T extends any>(array: T[]): array is [T, ...T[]] {
  return Array.isArray(array);
}

export type AuthFlowType = "login" | "register";

export function isAuthType(authType: string | null): authType is AuthFlowType {
  return !!authType && ["login", "register"].includes(authType);
}
