import React from 'react';
export interface JourneyStage {
    id: string;
    name: string;
    icon: React.ReactNode;
    color: string;
    position: {
        x: number;
        y: number;
    };
}
export interface ChildJourneyPosition {
    childId: string;
    childName: string;
    avatarUrl?: string;
    stageId: string;
    position: {
        x: number;
        y: number;
    };
}
interface JourneyGraphicProps {
    stages: JourneyStage[];
    childPositions: ChildJourneyPosition[];
    className?: string;
}
declare const JourneyGraphic: React.FC<JourneyGraphicProps>;
export default JourneyGraphic;
