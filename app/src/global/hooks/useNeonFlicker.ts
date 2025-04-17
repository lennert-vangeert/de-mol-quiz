import { useEffect } from "react";
import gsap from "gsap";

// Define your glow states
const SHADOWS = {
  full: `0 0 7px #fff, 0 0 10px #fff, 0 0 21px #fff,
         0 0 42px #0cdbf2, 0 0 82px #0cdbf2, 0 0 92px #0cdbf2,
         0 0 102px #0cdbf2, 0 0 151px #0cdbf2`,
  medium: `0 0 4px #fff, 0 0 8px #fff, 0 0 16px #fff,
           0 0 32px #0cdbf2, 0 0 64px #0cdbf2, 0 0 74px #0cdbf2,
           0 0 84px #0cdbf2, 0 0 121px #0cdbf2`,
  none: "none",
};
const VARIANTS = Object.values(SHADOWS);

// Utility to pick a random item
function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Core flicker animation: animates both text-shadow and opacity
function startFlicker(el: Element) {
  const tl = gsap.timeline({
    onComplete: () => startFlicker(el),
  });

  // 1–3 quick, random sub-flickers
  const rounds = Math.floor(Math.random() * 3) + 1;
  for (let i = 0; i < rounds; i++) {
    const dur = Math.random() * 0.25 + 0.05; // 0.05–0.3s
    const shadow = pick(VARIANTS);
    const opacity = shadow === SHADOWS.none ? 0 : Math.random() * 0.3 + 0.7; // 0.7–1.0
    tl.to(el, { textShadow: shadow, opacity, duration: dur });
  }

  // Ease back to full glow and full opacity
  tl.to(el, {
    textShadow: SHADOWS.full,
    opacity: 1,
    duration: Math.random() * 0.5 + 0.5, // 0.5–1.0s
  });
}

// Hook to apply neon flicker to any class
export function useNeonFlicker(className: string) {
  useEffect(() => {
    let destroyed = false;

    function init() {
      if (destroyed) return;
      const els = gsap.utils.toArray(`.${className}`) as Element[];
      if (els.length === 0) {
        // retry if elements not yet in DOM
        window.setTimeout(init, 100);
        return;
      }
      els.forEach(startFlicker);
    }

    init();

    return () => {
      destroyed = true;
      gsap.killTweensOf(`.${className}`);
    };
  }, [className]);
}
