import { BaseEdge, EdgeLabelRenderer, getBezierPath, type EdgeProps } from '@xyflow/react'
import { ARROW_TYPE_COLORS, ARROW_TYPE_LABELS } from '@/entities/idef0/constants'
import type { ArrowEdgeData } from '@/features/diagram/lib/flowMappers'

export const ArrowEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
  markerEnd,
}: EdgeProps<ArrowEdgeData>) => {
  const [path, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  })

  const arrow = data?.arrow
  const color = arrow ? ARROW_TYPE_COLORS[arrow.arrowType] : '#2563eb'

  return (
    <>
      <BaseEdge id={id} path={path} markerEnd={markerEnd} style={{ stroke: color, strokeWidth: selected ? 3 : 2.5 }} />
      {arrow ? (
        <EdgeLabelRenderer>
          <div
            className="absolute -translate-x-1/2 -translate-y-1/2 rounded border border-slate-300 bg-white/90 px-2 py-1 text-[11px] font-medium text-slate-700 shadow-sm"
            style={{ transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)` }}
          >
            <div>{arrow.label || 'Без подписи'}</div>
            <div className="text-[10px] uppercase text-slate-400">{ARROW_TYPE_LABELS[arrow.arrowType]}</div>
          </div>
        </EdgeLabelRenderer>
      ) : null}
    </>
  )
}
