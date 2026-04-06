import {
  LOCAL_STORAGE_PENDING_KEY,
  LOCAL_STORAGE_PROJECT_KEY,
} from '@/entities/idef0/constants'
import type { IDEF0Project } from '@/types/idef0'

export const saveProjectToStorage = (project: IDEF0Project): void => {
  localStorage.setItem(LOCAL_STORAGE_PROJECT_KEY, JSON.stringify(project))
  localStorage.setItem(LOCAL_STORAGE_PENDING_KEY, '1')
}

export const clearStoredProject = (): void => {
  localStorage.removeItem(LOCAL_STORAGE_PROJECT_KEY)
  localStorage.removeItem(LOCAL_STORAGE_PENDING_KEY)
}

export const hasStoredDraft = (): boolean => localStorage.getItem(LOCAL_STORAGE_PENDING_KEY) === '1'

export const loadStoredProject = (): IDEF0Project | null => {
  const raw = localStorage.getItem(LOCAL_STORAGE_PROJECT_KEY)
  if (!raw) {
    return null
  }

  try {
    return JSON.parse(raw) as IDEF0Project
  } catch {
    clearStoredProject()
    return null
  }
}
