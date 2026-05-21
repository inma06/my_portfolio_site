import { useEffect, useState } from "react";

interface UseTypewriterOptions {
  typeSpeed?: number;
  deleteSpeed?: number;
  pauseEnd?: number;
  pauseStart?: number;
  loop?: boolean;
}

export function useTypewriter(
  text: string,
  {
    typeSpeed = 90,
    deleteSpeed = 45,
    pauseEnd = 1600,
    pauseStart = 500,
    loop = true,
  }: UseTypewriterOptions = {},
): string {
  const [index, setIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let timeoutId: number | undefined;

    if (!deleting && index < text.length) {
      timeoutId = window.setTimeout(() => setIndex((i) => i + 1), typeSpeed);
    } else if (!deleting && index === text.length) {
      if (!loop) return;
      timeoutId = window.setTimeout(() => setDeleting(true), pauseEnd);
    } else if (deleting && index > 0) {
      timeoutId = window.setTimeout(() => setIndex((i) => i - 1), deleteSpeed);
    } else if (deleting && index === 0) {
      timeoutId = window.setTimeout(() => setDeleting(false), pauseStart);
    }

    return () => {
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
    };
  }, [
    index,
    deleting,
    text,
    typeSpeed,
    deleteSpeed,
    pauseEnd,
    pauseStart,
    loop,
  ]);

  return text.slice(0, index);
}
