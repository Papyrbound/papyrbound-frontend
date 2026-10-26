"use client";

import {
  createContext,
  useContext,
  type ComponentProps,
  type PropsWithChildren,
} from "react";
import {
  LazyMotion,
  domMax,
  m,
  MotionConfig,
  useReducedMotion,
} from "motion/react";
import { useAccount } from "@/features/profile/stores/account-store";
import { Card } from "@/shared/ui/card";

const ReducedMotionContext = createContext(true);
export const readingEase = [0.22, 1, 0.36, 1] as const;

export function ReadingMotionProvider({ children }: PropsWithChildren) {
  const systemReduced = useReducedMotion();
  const { preferences } = useAccount();
  const reduced = preferences.reduceMotion || Boolean(systemReduced);
  return (
    <ReducedMotionContext.Provider value={reduced}>
      <LazyMotion features={domMax} strict>
        <MotionConfig reducedMotion={reduced ? "always" : "never"}>
          {children}
        </MotionConfig>
      </LazyMotion>
    </ReducedMotionContext.Provider>
  );
}

export function useReadingMotion() {
  return useContext(ReducedMotionContext);
}

const MotionCard = m.create(Card);

/** Entrance motion decorates the existing shadcn Card without adding a layout wrapper. */
export function RevealCard({
  index = 0,
  ...props
}: Omit<
  ComponentProps<typeof MotionCard>,
  "initial" | "whileInView" | "viewport" | "transition"
> & { index?: number }) {
  const reduced = useReadingMotion();
  return (
    <MotionCard
      {...props}
      data-reading-reveal=""
      initial={reduced ? false : { opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.08 }}
      transition={{
        duration: reduced ? 0 : 0.5,
        ease: readingEase,
        delay: reduced ? 0 : Math.min(index, 6) * 0.055,
      }}
    />
  );
}
