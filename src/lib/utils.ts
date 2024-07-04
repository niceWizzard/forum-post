import { type ClassValue, clsx } from "clsx";
import { useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const useEffectUpdate: typeof useEffect = (effect, deps) => {
  const [hasRendered, setHasRendered] = useState(false);
  useEffect(() => {
    if (!hasRendered) {
      setHasRendered(true);
      return;
    }

    return effect();
  }, deps);
};
