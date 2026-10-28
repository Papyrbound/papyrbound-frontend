"use client";

import { createContext, useContext, type PropsWithChildren } from "react";
import {
  LazyMotion,
  domMax,
  MotionConfig,
  useReducedMotion,
} from "motion/react";
import { useAccount } from "@/features/profile/stores/account-store";

const ReducedMotionContext = createContext(true);

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
