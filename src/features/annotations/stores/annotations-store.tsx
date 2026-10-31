"use client";
import { create } from "zustand";
import type { Dispatch, SetStateAction, PropsWithChildren } from "react";
import { sampleAnnotations, type Annotation } from "@/features/annotations/model/annotation";
export const useAnnotations = create<{ annotations: Annotation[]; setAnnotations: Dispatch<SetStateAction<Annotation[]>> }>((set) => ({annotations: sampleAnnotations, setAnnotations: update => set(s => ({annotations: typeof update === "function" ? update(s.annotations) : update}))}));
export function AnnotationsProvider({children}: PropsWithChildren) {return children;}
