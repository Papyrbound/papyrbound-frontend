"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type Dispatch,
  type PropsWithChildren,
  type SetStateAction,
} from "react";
import {
  sampleAnnotations,
  type Annotation,
} from "@/features/annotations/model/annotation";

const AnnotationsContext = createContext<{
  annotations: Annotation[];
  setAnnotations: Dispatch<SetStateAction<Annotation[]>>;
} | null>(null);

export function AnnotationsProvider({ children }: PropsWithChildren) {
  const [annotations, setAnnotations] = useState(sampleAnnotations);
  const value = useMemo(() => ({ annotations, setAnnotations }), [annotations]);
  return (
    <AnnotationsContext.Provider value={value}>
      {children}
    </AnnotationsContext.Provider>
  );
}

export function useAnnotations() {
  const value = useContext(AnnotationsContext);
  if (!value)
    throw new Error("useAnnotations must be used within AnnotationsProvider");
  return value;
}
