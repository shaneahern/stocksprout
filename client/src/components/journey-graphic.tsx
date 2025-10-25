import React from 'react';

export interface JourneyStage {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  position: { x: number; y: number };
}

export interface ChildJourneyPosition {
  childId: string;
  childName: string;
  avatarUrl?: string;
  stageId: string;
  position: { x: number; y: number };
}

interface JourneyGraphicProps {
  stages: JourneyStage[];
  childPositions: ChildJourneyPosition[];
  className?: string;
}

const JourneyGraphic: React.FC<JourneyGraphicProps> = ({
  stages,
  childPositions,
  className = ""
}) => {
  return (
    <div className={`relative w-full h-80 ${className}`}>
      {/* SVG Container with smooth S-shaped path */}
      <svg 
        className="absolute inset-0 w-full h-full" 
        viewBox="0 0 400 320"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Clip paths for child avatars */}
        <defs>
          {childPositions.map((c) => (
            <clipPath id={`avatar-clip-${c.childId}`} key={c.childId}>
              <circle cx={Math.round(c.position.x)} cy={Math.round(c.position.y)} r="14" />
            </clipPath>
          ))}
        </defs>
        
        {/* True S-shaped path with adjusted horizontal lines */}
        <path
          d="M 80 250 L 280 250 Q 350 250 350 200 Q 350 150 280 150 L 120 150 Q 50 150 50 100 Q 50 50 120 50 L 320 50"
          fill="none"
          stroke="#D1D5DB"
          strokeWidth="20"
          strokeLinecap="round"
        />
        
        {/* Journey Stages */}
        {stages.map((stage) => (
          <g key={stage.id}>
            {/* Stage Circle */}
            <circle
              cx={stage.position.x}
              cy={stage.position.y}
              r="20"
              fill={stage.color}
              stroke="white"
              strokeWidth="2"
            />
            
            {/* Stage Icon */}
            <foreignObject
              x={stage.position.x - 8}
              y={stage.position.y - 8}
              width="16"
              height="16"
            >
              <div className="flex items-center justify-center w-full h-full text-white">
                {stage.icon}
              </div>
            </foreignObject>
            
            {/* Stage Label */}
            <text
              x={stage.position.x}
              y={stage.position.y + 35}
              textAnchor="middle"
              className="text-xs font-medium fill-gray-700"
              fontSize="10"
            >
              {stage.name}
            </text>
          </g>
        ))}
        
        {/* Child Avatars */}
        {childPositions.map((child) => {
          const x = Math.round(child.position.x);
          const y = Math.round(child.position.y);
          
          return (
            <g key={child.childId}>
              {child.avatarUrl ? (
                <>
                  {/* Avatar image clipped to a circle */}
                  <image
                    x={x - 14}
                    y={y - 14}
                    width={28}
                    height={28}
                    href={child.avatarUrl}
                    preserveAspectRatio="xMidYMid slice"
                    clipPath={`url(#avatar-clip-${child.childId})`}
                  />
                  {/* Blue ring on top */}
                  <circle
                    cx={x}
                    cy={y}
                    r="16"
                    fill="none"
                    stroke="#3B82F6"
                    strokeWidth="2"
                  />
                </>
              ) : (
                <>
                  {/* Fallback circle with initial */}
                  <circle
                    cx={x}
                    cy={y}
                    r="14"
                    fill="#E5E7EB"
                    clipPath={`url(#avatar-clip-${child.childId})`}
                  />
                  <text
                    x={x}
                    y={y}
                    textAnchor="middle"
                    dominantBaseline="central"
                    className="text-sm font-medium fill-gray-600"
                    fontSize="12"
                  >
                    {child.childName.charAt(0)}
                  </text>
                  {/* Blue ring on top */}
                  <circle
                    cx={x}
                    cy={y}
                    r="16"
                    fill="none"
                    stroke="#3B82F6"
                    strokeWidth="2"
                  />
                </>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default JourneyGraphic;
