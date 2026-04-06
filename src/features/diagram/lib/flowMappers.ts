import type { Edge, Node } from '@xyflow/react'
import { MarkerType } from '@xyflow/react'
import { ARROW_TYPE_COLORS } from '@/entities/idef0/constants'
import type { IDEF0Arrow, IDEF0Diagram, IDEF0Node } from '@/types/idef0'

export interface FunctionNodeData {
  node: IDEF0Node
}

export interface BoundaryNodeData {
  node: IDEF0Node
}

export interface ArrowEdgeData {
  arrow: IDEF0Arrow
}

export type FlowNodeData = FunctionNodeData | BoundaryNodeData

export const toFlowNodes = (diagram: IDEF0Diagram): Node<FlowNodeData>[] =>
  diagram.nodes.map((node) => ({
    id: node.id,
    type: node.kind === 'function' ? 'idef0Function' : 'boundaryPort',
    position: node.position,
    data: { node },
    width: node.width,
    height: node.height,
    draggable: true,
    selectable: true,
  }))

export const toFlowEdges = (diagram: IDEF0Diagram): Edge<ArrowEdgeData>[] =>
  diagram.arrows.map((arrow) => ({
    id: arrow.id,
    source: arrow.source,
    target: arrow.target,
    sourceHandle: arrow.sourceHandle,
    targetHandle: arrow.targetHandle,
    type: 'idef0Arrow',
    label: arrow.label,
    data: { arrow },
    animated: false,
    markerEnd: {
      type: MarkerType.ArrowClosed,
      width: 18,
      height: 18,
      color: ARROW_TYPE_COLORS[arrow.arrowType],
    },
    style: {
      stroke: ARROW_TYPE_COLORS[arrow.arrowType],
      strokeWidth: 2.5,
    },
  }))
