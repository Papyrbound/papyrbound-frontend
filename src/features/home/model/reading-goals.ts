"use client"

import { useSyncExternalStore } from "react"

type ReadingDay = { minutes: number; goal: number }
type ReadingGoals = { version: 1; goal: number; days: Record<string, ReadingDay> }
const key = "papyrbound-reading-goals-v1"
const event = "papyrbound-reading-goals-change"
const defaults: ReadingGoals = { version: 1, goal: 20, days: {} }
let snapshot = defaults
let previousRaw: string | null | undefined

export function dayKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
}

function read(): ReadingGoals {
  try {
    const raw = localStorage.getItem(key)
    if (raw !== previousRaw) {
      previousRaw = raw
      if (!raw) { snapshot = defaults; return snapshot }
      const data = JSON.parse(raw)
      if (data.version !== 1 || !Number.isInteger(data.goal) || data.goal < 1 || data.goal > 240) return snapshot
      const days: Record<string, ReadingDay> = {}
      for (const [date, value] of Object.entries(data.days ?? {})) {
        const day = value as ReadingDay
        if (/^\d{4}-\d{2}-\d{2}$/.test(date) && Number.isInteger(day?.minutes) && day.minutes >= 0 && day.minutes <= 1440 && Number.isInteger(day.goal) && day.goal > 0 && day.goal <= 240) days[date] = day
      }
      snapshot = { version: 1, goal: data.goal, days }
    }
  } catch { /* Keep the current session usable if storage is unavailable. */ }
  return snapshot
}

function subscribe(callback: () => void) {
  const onStorage = (change: StorageEvent) => { if (change.key === key || change.key === null) callback() }
  window.addEventListener("storage", onStorage)
  window.addEventListener(event, callback)
  return () => { window.removeEventListener("storage", onStorage); window.removeEventListener(event, callback) }
}

export function useReadingGoals() { return useSyncExternalStore(subscribe, read, () => defaults) }

export function saveReadingGoal(goal: number, minutes: number) {
  if (!Number.isInteger(goal) || goal < 1 || goal > 240 || !Number.isInteger(minutes) || minutes < 0 || minutes > 1440) return false
  const current = read()
  const today = dayKey(new Date())
  snapshot = { version: 1, goal, days: { ...current.days, [today]: { minutes, goal } } }
  let saved = false
  try {
    const raw = JSON.stringify(snapshot)
    localStorage.setItem(key, raw)
    previousRaw = raw
    saved = true
  } catch { /* Fall back to session-only updates. */ }
  window.dispatchEvent(new Event(event))
  return saved
}
