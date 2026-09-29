import type { Diagram } from '@/content/types'
import { layoutDiagram } from '@/lib/diagram-layout'

interface ArchitectureDiagramProps {
  readonly diagram: Diagram
  readonly id: string
  readonly title: string
}

/** Server-rendered SVG. No diagram library ships to the browser. */
export function ArchitectureDiagram({ diagram, id, title }: ArchitectureDiagramProps) {
  const layout = layoutDiagram(diagram)
  const arrowId = `${id}-arrow`
  const titleId = `${id}-title`
  const descId = `${id}-desc`

  return (
    // Focusable so keyboard users can scroll the diagram on small screens.
    <div
      role="region"
      aria-label={`${title} architecture diagram`}
      tabIndex={0}
      className="overflow-x-auto"
    >
      <svg
        viewBox={`0 0 ${layout.width} ${layout.height}`}
        role="img"
        aria-labelledby={`${titleId} ${descId}`}
        className="h-auto w-full min-w-[34rem]"
        style={{ maxWidth: layout.width }}
      >
        <title id={titleId}>{`${title} architecture`}</title>
        <desc id={descId}>{diagram.description}</desc>
        <defs>
          <marker
            id={arrowId}
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="7"
            markerHeight="7"
            orient="auto-start-reverse"
          >
            <path d="M0 1 9 5 0 9z" className="fill-ink-3" />
          </marker>
        </defs>

        {layout.edges.map((edge) => (
          <line
            key={`${edge.from}-${edge.to}`}
            x1={edge.start.x}
            y1={edge.start.y}
            x2={edge.end.x}
            y2={edge.end.y}
            className="stroke-ink-3"
            strokeWidth={1.25}
            markerEnd={`url(#${arrowId})`}
          />
        ))}

        {layout.nodes.map((node) => (
          <g key={node.id}>
            <rect
              x={node.x}
              y={node.y}
              width={node.width}
              height={node.height}
              rx={10}
              className="fill-surface stroke-rule"
            />
            <text
              x={node.x + 16}
              y={node.y + (node.detail ? 27 : node.height / 2 + 5)}
              className="fill-ink font-sans text-[14px] font-semibold"
            >
              {node.label}
            </text>
            {node.detail && (
              <text x={node.x + 16} y={node.y + 47} className="fill-ink-2 font-sans text-[12px]">
                {node.detail}
              </text>
            )}
          </g>
        ))}

        {layout.edges
          .filter((edge) => edge.label)
          .map((edge) => (
            <text
              key={`${edge.from}-${edge.to}-label`}
              x={edge.mid.x}
              y={edge.mid.y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-ink-2 stroke-paper font-sans text-[11px] [paint-order:stroke]"
              strokeWidth={6}
              strokeLinejoin="round"
            >
              {edge.label}
            </text>
          ))}
      </svg>
    </div>
  )
}
