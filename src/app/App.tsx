import type { Node } from '@xyflow/react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { LeftSidebar } from '@/components/LeftSidebar'
import { RightSidebar } from '@/components/RightSidebar'
import { TopBar } from '@/components/TopBar'
import { DiagramEditor } from '@/features/diagram/ui/DiagramEditor'
import { useCurrentDiagram, useIdef0Store } from '@/features/diagram/model/useIdef0Store'
import { downloadProjectJson, parseProjectJson } from '@/features/project/lib/projectFile'
import {
  clearStoredProject,
  hasStoredDraft,
  loadStoredProject,
  saveProjectToStorage,
} from '@/features/project/lib/projectStorage'

const isEditableTarget = (target: EventTarget | null): boolean => {
  if (!(target instanceof HTMLElement)) {
    return false
  }

  return ['INPUT', 'TEXTAREA'].includes(target.tagName) || target.isContentEditable
}

const App = () => {
  const canvasRef = useRef<HTMLDivElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [flowNodes, setFlowNodes] = useState<Node[]>([])
  const currentDiagram = useCurrentDiagram()
  const {
    project,
    currentDiagramId,
    issues,
    past,
    future,
    setProject,
    newProject,
    setProjectName,
    navigateToDiagram,
    createContextFunction,
    addFunctionNode,
    addBoundaryNode,
    toggleStrictMode,
    toggleSnapToGrid,
    toggleMiniMap,
    undo,
    redo,
    deleteSelection,
  } = useIdef0Store(
    useShallow((state) => ({
      project: state.project,
      currentDiagramId: state.currentDiagramId,
      issues: state.issues,
      past: state.past,
      future: state.future,
      setProject: state.setProject,
      newProject: state.newProject,
      setProjectName: state.setProjectName,
      navigateToDiagram: state.navigateToDiagram,
      createContextFunction: state.createContextFunction,
      addFunctionNode: state.addFunctionNode,
      addBoundaryNode: state.addBoundaryNode,
      toggleStrictMode: state.toggleStrictMode,
      toggleSnapToGrid: state.toggleSnapToGrid,
      toggleMiniMap: state.toggleMiniMap,
      undo: state.undo,
      redo: state.redo,
      deleteSelection: state.deleteSelection,
    })),
  )

  const exportFilePrefix = useMemo(
    () => `${project.name.replace(/\s+/g, '-').toLowerCase()}-${currentDiagram?.nodeNumber ?? currentDiagramId}`,
    [currentDiagram, currentDiagramId, project.name],
  )

  useEffect(() => {
    if (!project.settings.autoSave) {
      return
    }

    const timer = window.setTimeout(() => {
      saveProjectToStorage(project)
    }, 400)

    return () => window.clearTimeout(timer)
  }, [project])

  useEffect(() => {
    if (!hasStoredDraft()) {
      return
    }

    const stored = loadStoredProject()
    if (!stored) {
      return
    }

    if (window.confirm('Найден несохранённый локальный проект. Восстановить его?')) {
      setProject(stored)
    }
  }, [setProject])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isEditableTarget(event.target)) {
        return
      }

      const metaKey = event.ctrlKey || event.metaKey

      if (event.key === 'Delete') {
        event.preventDefault()
        deleteSelection()
      }

      if (metaKey && event.key.toLowerCase() === 's') {
        event.preventDefault()
        downloadProjectJson(project)
      }

      if (metaKey && !event.shiftKey && event.key.toLowerCase() === 'z') {
        event.preventDefault()
        undo()
      }

      if (metaKey && event.shiftKey && event.key.toLowerCase() === 'z') {
        event.preventDefault()
        redo()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [deleteSelection, project, redo, undo])

  const handleImportJson = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    const content = await file.text()
    try {
      setProject(parseProjectJson(content))
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'Не удалось импортировать JSON')
    } finally {
      event.target.value = ''
    }
  }

  const ensureExportReady = (): HTMLElement => {
    if (!canvasRef.current || !currentDiagram) {
      throw new Error('Нет активной диаграммы для экспорта.')
    }

    const viewport = canvasRef.current.querySelector('.react-flow__viewport')
    if (!(viewport instanceof HTMLElement)) {
      throw new Error('Не удалось найти canvas для экспорта.')
    }

    return viewport
  }

  const handleExport = async (type: 'png' | 'svg' | 'pdf') => {
    try {
      const element = ensureExportReady()
      if (flowNodes.length === 0) {
        window.alert('На диаграмме нет элементов для экспорта.')
        return
      }

      const { exportDiagramToPdf, exportDiagramToPng, exportDiagramToSvg } = await import(
        '@/features/export/lib/exportDiagram'
      )

      if (type === 'png') {
        await exportDiagramToPng(element, flowNodes, `${exportFilePrefix}.png`)
      }

      if (type === 'svg') {
        await exportDiagramToSvg(element, flowNodes, `${exportFilePrefix}.svg`)
      }

      if (type === 'pdf') {
        await exportDiagramToPdf(element, flowNodes, `${exportFilePrefix}.pdf`)
      }
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'Экспорт завершился ошибкой')
    }
  }

  const handleNewProject = () => {
    if (!window.confirm('Создать новый проект и очистить текущее состояние?')) {
      return
    }

    clearStoredProject()
    newProject()
  }

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-4 text-slate-900">
      <input ref={fileInputRef} type="file" accept="application/json" className="hidden" onChange={handleImportJson} />
      <div className="mx-auto flex max-w-[1800px] flex-col gap-4">
        <TopBar
          projectName={project.name}
          onProjectNameChange={setProjectName}
          strictMode={project.settings.strictMode}
          canUndo={past.length > 0}
          canRedo={future.length > 0}
          issues={issues}
          onNewProject={handleNewProject}
          onImportProject={() => fileInputRef.current?.click()}
          onSaveProject={() => downloadProjectJson(project)}
          onExportPng={() => void handleExport('png')}
          onExportSvg={() => void handleExport('svg')}
          onExportPdf={() => void handleExport('pdf')}
          onUndo={undo}
          onRedo={redo}
          onToggleStrictMode={toggleStrictMode}
        />

        <div className="grid min-h-[calc(100vh-116px)] grid-cols-1 gap-4 xl:grid-cols-[320px_minmax(0,1fr)_360px]">
          <LeftSidebar
            diagrams={project.diagrams}
            currentDiagramId={currentDiagramId}
            onNavigate={navigateToDiagram}
            onAddFunction={() =>
              currentDiagram?.isContext && currentDiagram.nodes.filter((node) => node.kind === 'function').length === 0
                ? createContextFunction({ x: 260, y: 180 })
                : addFunctionNode({ x: 240, y: 180 })
            }
            onAddInput={() => addBoundaryNode('input', { x: 40, y: 180 })}
            onAddControl={() => addBoundaryNode('control', { x: 220, y: 20 })}
            onAddOutput={() => addBoundaryNode('output', { x: 620, y: 180 })}
            onAddMechanism={() => addBoundaryNode('mechanism', { x: 220, y: 360 })}
            snapToGrid={project.settings.snapToGrid}
            showMiniMap={project.settings.showMiniMap}
            onToggleSnapToGrid={toggleSnapToGrid}
            onToggleMiniMap={toggleMiniMap}
          />
          <DiagramEditor canvasRef={canvasRef} onFlowNodesChange={setFlowNodes} />
          <RightSidebar issues={issues} />
        </div>
      </div>
    </div>
  )
}

export default App
