import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

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
        {childPositions.map((child) => (
          <g key={child.childId}>
            {/* Child Avatar Circle */}
            <circle
              cx={child.position.x}
              cy={child.position.y}
              r="12"
              fill="white"
              stroke="#3B82F6"
              strokeWidth="2"
            />
            
            {/* Child Avatar */}
            <foreignObject
              x={child.position.x - 10}
              y={child.position.y - 10}
              width="20"
              height="20"
            >
              <Avatar className="w-5 h-5">
                <AvatarImage src={child.avatarUrl} />
                <AvatarFallback className="text-xs">
                  {child.childName.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </foreignObject>
          </g>
        ))}
      </svg>
    </div>
  );
};

export default JourneyGraphic;
