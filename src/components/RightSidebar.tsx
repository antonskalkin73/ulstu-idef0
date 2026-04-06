import { AlertTriangle, ArrowRightLeft, Box, GitBranchPlus } from 'lucide-react'
import { useShallow } from 'zustand/react/shallow'
import { ARROW_TYPE_LABELS } from '@/entities/idef0/constants'
import { useCurrentDiagram, useIdef0Store } from '@/features/diagram/model/useIdef0Store'
import type { ValidationIssue } from '@/types/idef0'

interface RightSidebarProps {
  issues: ValidationIssue[]
}

export const RightSidebar = ({ issues }: RightSidebarProps) => {
  const diagram = useCurrentDiagram()
  const { selectedElement, updateNode, updateArrow, updateDiagramTitle, openDecomposition } = useIdef0Store(
    useShallow((state) => ({
      selectedElement: state.selectedElement,
      updateNode: state.updateNode,
      updateArrow: state.updateArrow,
      updateDiagramTitle: state.updateDiagramTitle,
      openDecomposition: state.openDecomposition,
    })),
  )

  const selectedNode =
    selectedElement?.kind === 'node' ? diagram?.nodes.find((node) => node.id === selectedElement.id) : undefined
  const selectedArrow =
    selectedElement?.kind === 'arrow' ? diagram?.arrows.find((arrow) => arrow.id === selectedElement.id) : undefined
  const diagramIssues = diagram ? issues.filter((issue) => issue.diagramId === diagram.id) : []

  return (
    <aside className="flex h-full flex-col gap-4 rounded-2xl border border-line bg-panel p-4 shadow-panel">
      <section className="rounded-xl border border-slate-200 p-4">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
          {selectedNode ? <Box className="h-4 w-4" /> : selectedArrow ? <ArrowRightLeft className="h-4 w-4" /> : <GitBranchPlus className="h-4 w-4" />}
          {selectedNode
            ? selectedNode.kind === 'function'
              ? 'Свойства блока'
              : 'Свойства интерфейса'
            : selectedArrow
              ? 'Свойства стрелки'
              : 'Свойства диаграммы'}
        </div>

        {selectedNode ? (
          <div className="space-y-3">
            <label className="block text-sm text-slate-600">
              <span className="mb-1 block">Имя</span>
              <input
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
                value={selectedNode.name}
                onChange={(event) => updateNode(selectedNode.id, { name: event.target.value })}
              />
            </label>
            {selectedNode.kind === 'function' ? (
              <label className="block text-sm text-slate-600">
                <span className="mb-1 block">Номер узла</span>
                <input className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2" value={selectedNode.nodeNumber ?? ''} disabled />
              </label>
            ) : (
              <label className="block text-sm text-slate-600">
                <span className="mb-1 block">Тип интерфейса</span>
                <input className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2" value={ARROW_TYPE_LABELS[selectedNode.boundaryRole ?? 'input']} disabled />
              </label>
            )}
            <label className="block text-sm text-slate-600">
              <span className="mb-1 block">Заметки</span>
              <textarea
                className="min-h-24 w-full rounded-lg border border-slate-300 px-3 py-2"
                value={selectedNode.notes ?? ''}
                onChange={(event) => updateNode(selectedNode.id, { notes: event.target.value })}
              />
            </label>
            {selectedNode.kind === 'function' ? (
              <button
                className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white"
                onClick={() => openDecomposition(selectedNode.id)}
              >
                {selectedNode.childDiagramId ? 'Открыть декомпозицию' : 'Создать декомпозицию'}
              </button>
            ) : null}
          </div>
        ) : selectedArrow ? (
          <div className="space-y-3">
            <label className="block text-sm text-slate-600">
              <span className="mb-1 block">Подпись</span>
              <input
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
                value={selectedArrow.label}
                onChange={(event) => updateArrow(selectedArrow.id, { label: event.target.value })}
              />
            </label>
            <label className="block text-sm text-slate-600">
              <span className="mb-1 block">Тип стрелки</span>
              <input className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2" value={ARROW_TYPE_LABELS[selectedArrow.arrowType]} disabled />
            </label>
          </div>
        ) : (
          <div className="space-y-3">
            <label className="block text-sm text-slate-600">
              <span className="mb-1 block">Название диаграммы</span>
              <input
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
                value={diagram?.title ?? ''}
                onChange={(event) => updateDiagramTitle(event.target.value)}
              />
            </label>
            <div className="rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
              <div className="font-medium text-slate-900">{diagram?.isContext ? 'Контекстная диаграмма' : 'Декомпозиция'}</div>
              <div className="mt-1">Номер узла: {diagram?.nodeNumber}</div>
            </div>
          </div>
        )}
      </section>

      <section className="flex-1 rounded-xl border border-slate-200 p-4">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
          <AlertTriangle className="h-4 w-4" /> Ошибки и предупреждения
        </div>
        <div className="space-y-2 overflow-auto pr-1">
          {diagramIssues.length === 0 ? (
            <div className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">Проблем для текущей диаграммы не найдено.</div>
          ) : (
            diagramIssues.map((issue) => (
              <div
                key={issue.id}
                className={`rounded-lg border p-3 text-sm ${
                  issue.severity === 'error'
                    ? 'border-red-200 bg-red-50 text-red-700'
                    : 'border-amber-200 bg-amber-50 text-amber-700'
                }`}
              >
                <div className="font-medium">{issue.message}</div>
                <div className="mt-1 text-xs uppercase opacity-70">{issue.code}</div>
              </div>
            ))
          )}
        </div>
      </section>
    </aside>
  )
}
