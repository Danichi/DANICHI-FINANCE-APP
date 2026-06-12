import { useState, useEffect, useRef } from 'react';

function easeOut(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export function useCountUp(target: number, duration = 1200, delay = 0): number {
  const [value, setValue] = useState(0);
  const startTime = useRef<number | null>(null);
  const rafId = useRef<number | null>(null);
  const started = useRef(false);

  useEffect(() => {
    if (target === 0) {
      setValue(0);
      return;
    }

    const startAnimation = () => {
      started.current = true;
      const animate = (timestamp: number) => {
        if (startTime.current === null) startTime.current = timestamp;
        const elapsed = timestamp - startTime.current;
        const progress = Math.min(elapsed / duration, 1);
        setValue(target * easeOut(progress));
        if (progress < 1) {
          rafId.current = requestAnimationFrame(animate);
        } else {
          setValue(target);
        }
      };
      rafId.current = requestAnimationFrame(animate);
    };

    const timeoutId = delay > 0
      ? setTimeout(startAnimation, delay)
      : (startAnimation(), undefined);

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (rafId.current) cancelAnimationFrame(rafId.current);
      startTime.current = null;
      started.current = false;
    };
  }, [target, duration, delay]);

  return value;
}
