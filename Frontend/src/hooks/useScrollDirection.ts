import { useState, useEffect } from "react";

/**
 * useScrollDirection
 * Detects whether the user is scrolling up or down.
 * Useful for hiding/showing navigation bars.
 */
export function useScrollDirection() {
  const [scrollDirection, setScrollDirection] = useState<"up" | "down" | "none">("none");
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const threshold = 10; // Minimum scroll amount to change state
    
    const updateScrollDirection = () => {
      const scrollY = window.pageYOffset;

      if (Math.abs(scrollY - lastScrollY) < threshold) {
        return;
      }

      const direction = scrollY > lastScrollY ? "down" : "up";
      
      if (direction !== scrollDirection && (scrollY > 0)) {
        setScrollDirection(direction);
      }
      
      setLastScrollY(scrollY > 0 ? scrollY : 0);
    };

    const onScroll = () => {
      window.requestAnimationFrame(updateScrollDirection);
    };

    window.addEventListener("scroll", onScroll);

    return () => window.removeEventListener("scroll", onScroll);
  }, [scrollDirection, lastScrollY]);

  return scrollDirection;
}
