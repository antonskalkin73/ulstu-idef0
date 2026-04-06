import { getNodesBounds, getViewportForBounds, type Node } from '@xyflow/react'
import { toPng, toSvg } from 'html-to-image'
import jsPDF from 'jspdf'
import { downloadTextFile } from '@/utils/idef0'

const PADDING = 60

const buildExportStyle = (nodes: Node[]): { width: number; height: number; style: Record<string, string> } => {
  const bounds = getNodesBounds(nodes)
  const width = Math.max(Math.ceil(bounds.width + PADDING * 2), 800)
  const height = Math.max(Math.ceil(bounds.height + PADDING * 2), 600)
  const viewport = getViewportForBounds(bounds, width, height, 0.1, 2, PADDING)

  return {
    width,
    height,
    style: {
      width: `${width}px`,
      height: `${height}px`,
      transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
      background: '#f8fafc',
    },
  }
}

export const exportDiagramToPng = async (
  element: HTMLElement,
  nodes: Node[],
  fileName: string,
): Promise<void> => {
  const exportStyle = buildExportStyle(nodes)
  const dataUrl = await toPng(element, {
    backgroundColor: '#f8fafc',
    pixelRatio: 2,
    width: exportStyle.width,
    height: exportStyle.height,
    style: exportStyle.style,
  })
  downloadTextFile(dataUrl, fileName, 'image/png')
}

export const exportDiagramToSvg = async (
  element: HTMLElement,
  nodes: Node[],
  fileName: string,
): Promise<void> => {
  const exportStyle = buildExportStyle(nodes)
  const dataUrl = await toSvg(element, {
    backgroundColor: '#f8fafc',
    width: exportStyle.width,
    height: exportStyle.height,
    style: exportStyle.style,
  })
  downloadTextFile(dataUrl, fileName, 'image/svg+xml')
}

export const exportDiagramToPdf = async (
  element: HTMLElement,
  nodes: Node[],
  fileName: string,
): Promise<void> => {
  const exportStyle = buildExportStyle(nodes)
  const dataUrl = await toPng(element, {
    backgroundColor: '#f8fafc',
    pixelRatio: 2,
    width: exportStyle.width,
    height: exportStyle.height,
    style: exportStyle.style,
  })

  const pdf = new jsPDF({
    orientation: exportStyle.width >= exportStyle.height ? 'landscape' : 'portrait',
    unit: 'px',
    format: [exportStyle.width, exportStyle.height],
  })

  pdf.addImage(dataUrl, 'PNG', 0, 0, exportStyle.width, exportStyle.height)
  pdf.save(fileName)
}
