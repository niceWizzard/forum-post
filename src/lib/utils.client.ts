import { useEffect, useState } from "react";

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
