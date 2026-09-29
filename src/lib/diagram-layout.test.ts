import { describe, expect, it } from 'vitest'
import type { Diagram } from '@/content/types'
import type { PositionedNode } from './diagram-layout'
import { LAYOUT, exitPoint, layoutDiagram } from './diagram-layout'

const box: PositionedNode = {
  id: 'a',
  label: 'A',
  col: 0,
  row: 0,
  x: 0,
  y: 0,
  width: 100,
  height: 50,
}

describe('exitPoint', () => {
  it('leaves through the right edge for a target to the right', () => {
    expect(exitPoint(box, { x: 500, y: 25 })).toEqual({ x: 100, y: 25 })
  })

  it('leaves through the bottom edge for a target below', () => {
    expect(exitPoint(box, { x: 50, y: 400 })).toEqual({ x: 50, y: 50 })
  })

  it('leaves through a corner-bound edge for a diagonal target', () => {
    const p = exitPoint(box, { x: 150, y: 125 })
    // Direction (100, 100) from the centre hits the bottom edge first.
    expect(p).toEqual({ x: 75, y: 50 })
  })

  it('pushes the point out by the gap', () => {
    expect(exitPoint(box, { x: 500, y: 25 }, 4)).toEqual({ x: 104, y: 25 })
  })

  it('returns the centre when the target is the centre', () => {
    expect(exitPoint(box, { x: 50, y: 25 })).toEqual({ x: 50, y: 25 })
  })
})

describe('layoutDiagram', () => {
  const diagram: Diagram = {
    description: 'Two boxes side by side, one below.',
    nodes: [
      { id: 'a', label: 'A', col: 0, row: 0 },
      { id: 'b', label: 'B', col: 1, row: 0 },
      { id: 'c', label: 'C', col: 0, row: 1 },
    ],
    edges: [
      { from: 'a', to: 'b', label: 'calls' },
      { from: 'a', to: 'c' },
      { from: 'a', to: 'missing' },
    ],
  }
  const { nodeWidth, nodeHeight, gapX, gapY, padding, arrowGap } = LAYOUT
  const result = layoutDiagram(diagram)

  it('sizes the canvas to the grid', () => {
    expect(result.width).toBe(padding * 2 + nodeWidth * 2 + gapX)
    expect(result.height).toBe(padding * 2 + nodeHeight * 2 + gapY)
  })

  it('places nodes on the grid', () => {
    const b = result.nodes.find((n) => n.id === 'b')
    expect(b).toMatchObject({ x: padding + nodeWidth + gapX, y: padding })
  })

  it('runs horizontal edges between facing sides, stopping short for the arrowhead', () => {
    const edge = result.edges.find((e) => e.to === 'b')
    expect(edge?.start).toEqual({ x: padding + nodeWidth, y: padding + nodeHeight / 2 })
    expect(edge?.end).toEqual({
      x: padding + nodeWidth + gapX - arrowGap,
      y: padding + nodeHeight / 2,
    })
    expect(edge?.label).toBe('calls')
  })

  it('drops edges to unknown nodes instead of drawing to nowhere', () => {
    expect(result.edges).toHaveLength(2)
  })
})
