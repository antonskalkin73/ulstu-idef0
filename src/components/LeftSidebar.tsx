import { GitBranch, Layers3, PlusSquare } from 'lucide-react'
import type { IDEF0Diagram } from '@/types/idef0'

interface LeftSidebarProps {
  diagrams: IDEF0Diagram[]
  currentDiagramId: string
  onNavigate: (diagramId: string) => void
  onAddFunction: () => void
  onAddInput: () => void
  onAddControl: () => void
  onAddOutput: () => void
  onAddMechanism: () => void
  snapToGrid: boolean
  showMiniMap: boolean
  onToggleSnapToGrid: () => void
  onToggleMiniMap: () => void
}

const DiagramTreeItem = ({
  diagram,
  depth,
  diagrams,
  currentDiagramId,
  onNavigate,
}: {
  diagram: IDEF0Diagram
  depth: number
  diagrams: IDEF0Diagram[]
  currentDiagramId: string
  onNavigate: (diagramId: string) => void
}) => {
  const children = diagrams.filter((item) => item.parentDiagramId === diagram.id)

  return (
    <div>
      <button
        className={`flex w-full items-start rounded-lg px-3 py-2 text-left text-sm transition hover:bg-slate-100 ${
          diagram.id === currentDiagramId ? 'bg-blue-50 text-blue-700' : 'text-slate-700'
        }`}
        style={{ paddingLeft: `${depth * 16 + 12}px` }}
        onClick={() => onNavigate(diagram.id)}
      >
        <span>
          <span className="block font-medium">{diagram.title}</span>
          <span className="text-xs text-slate-400">{diagram.nodeNumber}</span>
        </span>
      </button>
      {children.map((child) => (
        <DiagramTreeItem
          key={child.id}
          diagram={child}
          depth={depth + 1}
          diagrams={diagrams}
          currentDiagramId={currentDiagramId}
          onNavigate={onNavigate}
        />
      ))}
    </div>
  )
}

const quickActionClassName = 'rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50'

export const LeftSidebar = ({
  diagrams,
  currentDiagramId,
  onNavigate,
  onAddFunction,
  onAddInput,
  onAddControl,
  onAddOutput,
  onAddMechanism,
  snapToGrid,
  showMiniMap,
  onToggleSnapToGrid,
  onToggleMiniMap,
}: LeftSidebarProps) => (
  <aside className="flex h-full min-h-0 flex-col gap-4 overflow-hidden rounded-2xl border border-line bg-panel p-4 shadow-panel">
    <section className="min-h-0 flex-1">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
        <GitBranch className="h-4 w-4" /> Дерево диаграмм
      </div>
      <div className="h-full overflow-auto rounded-xl bg-slate-50 p-2">
        {diagrams
          .filter((diagram) => diagram.parentDiagramId === null)
          .map((diagram) => (
            <DiagramTreeItem
              key={diagram.id}
              diagram={diagram}
              depth={0}
              diagrams={diagrams}
              currentDiagramId={currentDiagramId}
              onNavigate={onNavigate}
            />
          ))}
      </div>
    </section>

    <section>
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
        <PlusSquare className="h-4 w-4" /> Быстрые действия
      </div>
      <div className="grid grid-cols-2 gap-2">
        <button className={quickActionClassName} onClick={onAddFunction}>Function</button>
        <button className={quickActionClassName} onClick={onAddInput}>Input</button>
        <button className={quickActionClassName} onClick={onAddControl}>Control</button>
        <button className={quickActionClassName} onClick={onAddOutput}>Output</button>
        <button className={quickActionClassName} onClick={onAddMechanism}>Mechanism</button>
      </div>
    </section>

    <section className="rounded-xl bg-slate-50 p-3">
      <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-900">
        <Layers3 className="h-4 w-4" /> Опции canvas
      </div>
      <label className="flex items-center justify-between gap-3 py-2 text-sm text-slate-600">
        <span>Snap to grid</span>
        <input type="checkbox" checked={snapToGrid} onChange={onToggleSnapToGrid} />
      </label>
      <label className="flex items-center justify-between gap-3 py-2 text-sm text-slate-600">
        <span>Миникарта</span>
        <input type="checkbox" checked={showMiniMap} onChange={onToggleMiniMap} />
      </label>
    </section>
  </aside>
)
