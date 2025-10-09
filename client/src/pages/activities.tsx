import { useState, useEffect } from 'react';
import MobileLayout from '@/components/mobile-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ChildSelector } from '@/components/child-selector';
import JourneyGraphic, { JourneyStage, ChildJourneyPosition } from '@/components/journey-graphic';
import { 
  Gamepad2, 
  Trophy, 
  Brain, 
  TrendingUp, 
  PiggyBank,
  Target,
  Award,
  Star,
  Zap,
  Medal,
  MapPin,
  Building2,
  ArrowUpRight,
  Wallet,
  FileText,
  Flag
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { mockChildren } from '@/lib/mock-data';

export default function Activities() {
  const { user } = useAuth();
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);

  // Journey stages configuration - positioned on the S-shaped path
  const journeyStages: JourneyStage[] = [
    {
      id: "game-on",
      name: "Game On",
      icon: <MapPin className="w-4 h-4" />,
      color: "#F97316", // Orange
      position: { x: 80, y: 250 } // Moved to match shorter bottom line
    },
    {
      id: "savings",
      name: "Savings",
      icon: <Building2 className="w-4 h-4" />,
      color: "#8B4513", // Brown
      position: { x: 260, y: 250 } // Moved a little more to the left
    },
    {
      id: "compound-interest",
      name: "Compound Interest",
      icon: <ArrowUpRight className="w-4 h-4" />,
      color: "#DC2626", // Red
      position: { x: 120, y: 150 } // Moved a little more to the right
    },
    {
      id: "cash-flow",
      name: "Cash Flow",
      icon: <Wallet className="w-4 h-4" />,
      color: "#2563EB", // Blue
      position: { x: 280, y: 150 } // Middle horizontal line on the right
    },
    {
      id: "investing",
      name: "Investing",
      icon: <FileText className="w-4 h-4" />,
      color: "#8B5CF6", // Purple
      position: { x: 120, y: 50 } // Moved a little more to the right
    },
    {
      id: "level-1-complete",
      name: "Level 1 Complete",
      icon: <Flag className="w-4 h-4" />,
      color: "#16A34A", // Green
      position: { x: 320, y: 50 } // Moved to match adjusted top line
    }
  ];

  // Fetch user's children from API for profile photos
  const { data: apiChildren = [] } = useQuery<any[]>({
    queryKey: ["/api/children", user?.id],
    enabled: !!user?.id,
  });

  // Merge API children data with mock journey stage data
  const children = mockChildren.map(mockChild => {
    const apiChild = apiChildren.find(apiChild => apiChild.name === mockChild.name);
    return {
      ...mockChild,
      profileImageUrl: apiChild?.profileImageUrl || null,
      // Keep mock journey stage data
      financialJourneyStage: mockChild.financialJourneyStage,
      progress: mockChild.progress
    };
  });

  // Set default child if available
  useEffect(() => {
    if (children.length > 0 && !selectedChildId) {
      setSelectedChildId(children[0].id);
    }
  }, [children, selectedChildId]);

  // Calculate child positions on journey
  const getChildJourneyPositions = (): ChildJourneyPosition[] => {
    return children.map((child: any, index: number) => {
      const stage = journeyStages.find(s => s.id === child.financialJourneyStage);
      let position;
      
      if (child.financialJourneyStage === "savings") {
        // Position child on Savings stage
        position = {
          x: 270,  // Slightly adjusted to the left
          y: 230   // Slightly above the Savings stage
        };
      } else if (child.financialJourneyStage === "compound-interest") {
        // Position child on Compound Interest stage
        position = {
          x: 130,  // Slightly adjusted to the left
          y: 130   // Slightly above the Compound Interest stage
        };
      } else {
        // Default positioning above the stage
        const stagePosition = stage?.position || journeyStages[0].position;
        position = {
          x: stagePosition.x + 10,  // Slightly adjusted to the left
          y: stagePosition.y - 40
        };
      }
      
      return {
        childId: child.id,
        childName: child.name,
        avatarUrl: child.profileImageUrl,
        stageId: child.financialJourneyStage,
        position
      };
    });
  };

  // Get current child and their progress
  const currentChild = children.find(child => child.id === selectedChildId);
  const currentChildProgress = currentChild?.progress || {
    points: 0,
    level: 1,
    gamesPlayed: 0,
    achievements: 0,
    badgesEarned: 0
  };

  const leaderboard = [
    { rank: 1, name: 'You', points: currentChildProgress.points, isCurrentUser: true },
    { rank: 2, name: 'Scottie N.', points: 100, isCurrentUser: false },
    { rank: 3, name: 'Emery N.', points: 10, isCurrentUser: false },
  ];

  const handleChildChange = (childId: string) => {
    setSelectedChildId(childId);
  };

  return (
    <MobileLayout currentTab="activities">
      <div className="space-y-6 pb-16">
        {/* Progress Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Progress</h1>
            <ChildSelector 
              currentChildId={selectedChildId || ''} 
              onChildChange={handleChildChange}
            />
          </div>
          
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-base sm:text-lg font-semibold">
                      Level {currentChildProgress.level} - Money Explorer
                    </h3>
                    <span className="text-xs sm:text-sm font-medium">
                      {currentChildProgress.points}/2000 pts
                    </span>
                  </div>
                  <div className="mb-3">
                    <Progress value={(currentChildProgress.points / 2000) * 100} className="h-3" />
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-4">
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl font-bold text-blue-600">
                      {currentChildProgress.gamesPlayed}
                    </div>
                    <div className="text-xs sm:text-sm text-muted-foreground">Games Played</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl font-bold text-green-600">
                      {currentChildProgress.achievements}
                    </div>
                    <div className="text-xs sm:text-sm text-muted-foreground">Achievements</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl font-bold text-amber-600">
                      {currentChildProgress.badgesEarned}
                    </div>
                    <div className="text-xs sm:text-sm text-muted-foreground">Badges Earned</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Leaderboard Section */}
        <div className="border border-gray-200 rounded-lg p-4 space-y-4">
          <div className="flex items-center gap-2">
            <Trophy className="w-6 h-6 text-amber-500" />
            <h2 className="text-2xl font-bold">Leaderboard</h2>
          </div>
          
          <div className="space-y-2">
            {leaderboard.map((entry) => (
              <div 
                key={entry.rank}
                className={`flex items-center justify-between p-2 rounded-lg ${
                  entry.isCurrentUser ? 'bg-blue-50 border-2 border-blue-200' : 'bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center">
                    <Medal className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-medium text-sm">{entry.name}</span>
                </div>
                <span className="font-bold text-sm">{entry.points} pts</span>
              </div>
            ))}
          </div>
        </div>

        {/* Journey Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Financial Journey</h2>
          
          <Card>
            <CardContent className="p-4 sm:p-6">
              <JourneyGraphic 
                stages={journeyStages}
                childPositions={getChildJourneyPositions()}
                className="mx-auto"
              />
              
            </CardContent>
          </Card>
        </div>
      </div>
    </MobileLayout>
  );

}
