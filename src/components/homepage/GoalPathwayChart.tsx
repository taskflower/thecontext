import { Brain, Database, FileText, GitBranch, Layout, LucideIcon } from 'lucide-react';


interface GoalPathwayChartProps {
  icons?: LucideIcon[];
}

export function GoalPathwayChart({ icons: providedIcons }: GoalPathwayChartProps) {
  // Default icons if none provided
  const defaultIcons = [
    Layout,      // Kanban board - starting point
    GitBranch,   // Process templates 
    FileText,    // Document management
    Brain,       // Context expansion
    Database     // Knowledge base
  ];

  const icons = providedIcons || defaultIcons;

  return (
    <svg
      viewBox="0 4 100 36"
      preserveAspectRatio="xMidYMid meet"
      className="w-full h-auto border"
    >
      {/* Horizontal baseline */}
      <line
        x1="0"
        y1="30"
        x2="100"
        y2="30"
        stroke="#d1d5db"
        strokeDasharray="1 1"
        strokeWidth="0.1"
      />

      {/* Vertical grid lines */}
      {Array.from({ length: 11 }).map((_, i) => (
        <line
          key={i}
          x1={i * 10}
          y1="0"
          x2={i * 10}
          y2="30"
          stroke="#d1d5db"
          strokeDasharray="1 1"
          strokeWidth="0.1"
        />
      ))}

      {/* Curve with 6 steps */}
      <polyline
        fill="none"
        stroke="#3b82f6"
        strokeWidth="0.25"
        points={Array.from({ length: 6 }, (_, i) => {
          const t = i / 5;
          const x = (i * 100) / 5;
          const y = 30 - 25 * t ** 3;
          return `${x},${y}`;
        }).join(" ")}
      />

      {/* Icons (starting from second step) */}
      {icons.map((Icon, i) => {
        if (i === 0) return null;
        const t = i / 5;
        const x = (i * 100) / 5;
        const y = 30 - 25 * t ** 3;

        return (
          <g key={i} transform={`translate(${x}, ${y})`}>
            <rect x="-4" y="-4" width="8" height="8" fill="#000" rx="1" />
            <Icon
              width={4}
              height={4}
              fill="none"
              stroke="#fff"
              strokeWidth={1}
              x={-2}
              y={-2}
            />
            <text
              x="0"
              y="8"
              fontSize="2.5"
              textAnchor="middle"
              fill="#6b7280"
            >
              {['Start', 'Process', 'Documents', 'Context', 'Knowledge'][i]}
            </text>
          </g>
        );
      })}
    </svg>
  );
}