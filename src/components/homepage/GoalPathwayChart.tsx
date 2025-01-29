/* eslint-disable @typescript-eslint/no-explicit-any */
// File: src/components/GoalPathwayChart.jsx

export function GoalPathwayChart({ icons }: any) {
  // {/* viewBox="0 0 100 40" */}
  return (
    <svg
      viewBox="0 4 100 36"
      preserveAspectRatio="xMidYMid meet"
      className="w-full h-auto border"
    >
      {/* Oś pozioma (dół) */}
      <line
        x1="0"
        y1="30"
        x2="100"
        y2="30"
        stroke="#d1d5db"
        strokeDasharray="1 1"
        strokeWidth="0.1"
      />

      {/* Linie pionowe */}
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

      {/* Krzywa z 6 krokami */}
      <polyline
        fill="none"
        stroke="#000"
        strokeWidth="0.25"
        points={Array.from({ length: 6 }, (_, i) => {
          const t = i / 5;
          const x = (i * 100) / 5;
          const y = 30 - 25 * t ** 3;
          return `${x},${y}`;
        }).join(" ")}
      />

      {/* Ikony (od drugiego "kroku") */}
      {icons.map(
        (
          Icon: React.ComponentType<{
            width: number;
            height: number;
            fill: string;
            stroke: string;
            strokeWidth: number;
            x: number;
            y: number;
          }>,
          i: number
        ) => {
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
            </g>
          );
        }
      )}
    </svg>
  );
}
