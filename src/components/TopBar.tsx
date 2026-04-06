import {
  Download,
  FileJson,
  FolderOpen,
  History,
  Redo2,
  Save,
  ShieldCheck,
  Undo2,
} from 'lucide-react'
import type { ValidationIssue } from '@/types/idef0'

interface TopBarProps {
  projectName: string
  onProjectNameChange: (value: string) => void
  strictMode: boolean
  canUndo: boolean
  canRedo: boolean
  issues: ValidationIssue[]
  onNewProject: () => void
  onImportProject: () => void
  onSaveProject: () => void
  onExportPng: () => void
  onExportSvg: () => void
  onExportPdf: () => void
  onUndo: () => void
  onRedo: () => void
  onToggleStrictMode: () => void
}

const buttonClassName =
  'inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50'

export const TopBar = ({
  projectName,
  onProjectNameChange,
  strictMode,
  canUndo,
  canRedo,
  issues,
  onNewProject,
  onImportProject,
  onSaveProject,
  onExportPng,
  onExportSvg,
  onExportPdf,
  onUndo,
  onRedo,
  onToggleStrictMode,
}: TopBarProps) => {
  const errorCount = issues.filter((issue) => issue.severity === 'error').length
  const warningCount = issues.filter((issue) => issue.severity === 'warning').length

  return (
    <header className="flex flex-wrap items-center gap-3 rounded-2xl border border-line bg-panel px-4 py-3 shadow-panel">
      <div className="flex min-w-[240px] flex-1 items-center gap-3">
        <div className="rounded-xl bg-blue-50 p-2 text-blue-600">
          <History className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <div className="text-xs uppercase tracking-wide text-slate-500">IDEF0 Editor</div>
          <input
            value={projectName}
            onChange={(event) => onProjectNameChange(event.target.value)}
            className="w-full border-none bg-transparent text-lg font-semibold text-slate-900 outline-none"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button className={buttonClassName} onClick={onNewProject}>
          <FileJson className="h-4 w-4" /> Новый проект
        </button>
        <button className={buttonClassName} onClick={onImportProject}>
          <FolderOpen className="h-4 w-4" /> Импорт JSON
        </button>
        <button className={buttonClassName} onClick={onSaveProject}>
          <Save className="h-4 w-4" /> Сохранить проект
        </button>
        <button className={buttonClassName} onClick={onExportPng}>
          <Download className="h-4 w-4" /> Экспорт PNG
        </button>
        <button className={buttonClassName} onClick={onExportSvg}>
          Экспорт SVG
        </button>
        <button className={buttonClassName} onClick={onExportPdf}>
          Экспорт PDF
        </button>
        <button className={`${buttonClassName} opacity-60`} disabled>
          Скачать все диаграммы
        </button>
        <button className={buttonClassName} onClick={onUndo} disabled={!canUndo}>
          <Undo2 className="h-4 w-4" /> Undo
        </button>
        <button className={buttonClassName} onClick={onRedo} disabled={!canRedo}>
          <Redo2 className="h-4 w-4" /> Redo
        </button>
        <button
          className={`${buttonClassName} ${strictMode ? 'border-blue-200 bg-blue-50 text-blue-700' : ''}`}
          onClick={onToggleStrictMode}
        >
          <ShieldCheck className="h-4 w-4" /> Строгий режим
        </button>
      </div>

      <div className="ml-auto flex items-center gap-2 text-xs">
        <span className="rounded-full bg-red-50 px-3 py-1 text-red-700">Ошибки: {errorCount}</span>
        <span className="rounded-full bg-amber-50 px-3 py-1 text-amber-700">Warnings: {warningCount}</span>
      </div>
    </header>
  )
}
