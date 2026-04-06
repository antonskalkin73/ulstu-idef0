import type { IDEF0Project } from '@/types/idef0'
import { downloadTextFile } from '@/utils/idef0'

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

export const parseProjectJson = (content: string): IDEF0Project => {
  const parsed = JSON.parse(content) as unknown

  if (!isObject(parsed) || !Array.isArray(parsed.diagrams) || typeof parsed.rootDiagramId !== 'string') {
    throw new Error('Некорректный JSON проекта IDEF0')
  }

  return parsed as IDEF0Project
}

export const serializeProject = (project: IDEF0Project): string => JSON.stringify(project, null, 2)

export const downloadProjectJson = (project: IDEF0Project): void => {
  downloadTextFile(serializeProject(project), 'idef0-project.json', 'application/json')
}
