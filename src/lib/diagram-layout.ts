/**
 * Turns a grid-positioned Diagram into SVG coordinates. Pure so the geometry
 * is tested without a DOM, and the component only draws what this returns.
 */
import type { Diagram, DiagramNode } from '@/content/types'

export const LAYOUT = {
  nodeWidth: 272,
  nodeHeight: 64,
  gapX: 72,
  gapY: 40,
  padding: 12,
  /** Space left between a line and the box it points at, for the arrowhead. */
  arrowGap: 4,
} as const

export interface PositionedNode extends DiagramNode {
  readonly x: number
  readonly y: number
  readonly width: number
  readonly height: number
}

export interface Point {
  readonly x: number
  readonly y: number
}

export interface PositionedEdge {
  readonly from: string
  readonly to: string
  readonly label?: string
  readonly start: Point
  readonly end: Point
  readonly mid: Point
}

export interface DiagramLayout {
  readonly width: number
  readonly height: number
  readonly nodes: readonly PositionedNode[]
  readonly edges: readonly PositionedEdge[]
}

const center = (n: PositionedNode): Point => ({ x: n.x + n.width / 2, y: n.y + n.height / 2 })

/** Where a ray from the centre of a box towards `toward` leaves the box, pushed out by `gap`. */
export function exitPoint(box: PositionedNode, toward: Point, gap = 0): Point {
  const c = center(box)
  const dx = toward.x - c.x
  const dy = toward.y - c.y
  if (dx === 0 && dy === 0) return c
  const halfW = box.width / 2 + gap
  const halfH = box.height / 2 + gap
  const t = Math.min(
    dx === 0 ? Infinity : halfW / Math.abs(dx),
    dy === 0 ? Infinity : halfH / Math.abs(dy),
  )
  return { x: c.x + dx * t, y: c.y + dy * t }
}

export function layoutDiagram(diagram: Diagram, layout = LAYOUT): DiagramLayout {
  const { nodeWidth, nodeHeight, gapX, gapY, padding, arrowGap } = layout
  const nodes: PositionedNode[] = diagram.nodes.map((node) => ({
    ...node,
    x: padding + node.col * (nodeWidth + gapX),
    y: padding + node.row * (nodeHeight + gapY),
    width: nodeWidth,
    height: nodeHeight,
  }))
  const byId = new Map(nodes.map((n) => [n.id, n]))

  const edges: PositionedEdge[] = diagram.edges.flatMap((edge) => {
    const from = byId.get(edge.from)
    const to = byId.get(edge.to)
    if (!from || !to) return []
    const start = exitPoint(from, center(to))
    const end = exitPoint(to, center(from), arrowGap)
    const mid = { x: (start.x + end.x) / 2, y: (start.y + end.y) / 2 }
    return [{ from: edge.from, to: edge.to, label: edge.label, start, end, mid }]
  })

  const cols = Math.max(...diagram.nodes.map((n) => n.col)) + 1
  const rows = Math.max(...diagram.nodes.map((n) => n.row)) + 1
  return {
    width: padding * 2 + cols * nodeWidth + (cols - 1) * gapX,
    height: padding * 2 + rows * nodeHeight + (rows - 1) * gapY,
    nodes,
    edges,
  }
}
