import { useState, useEffect } from 'react';
import MobileLayout from '@/components/mobile-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ChildSelector } from '@/components/child-selector';
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
  Medal
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';

export default function Activities() {
  const { user } = useAuth();
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);

  // Fetch user's children
  const { data: children = [] } = useQuery<any[]>({
    queryKey: ["/api/children", user?.id],
    enabled: !!user?.id,
  });

  // Set default child if available
  useEffect(() => {
    if (children.length > 0 && !selectedChildId) {
      setSelectedChildId(children[0].id);
    }
  }, [children, selectedChildId]);

  // Mock data for activities
  const currentChild = children.find(child => child.id === selectedChildId);
  const leaderboard = [
    { rank: 1, name: 'You', points: 1200, isCurrentUser: true },
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
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold">Level 3 - Money Explorer</h3>
                    <span className="text-sm font-medium">1200/2000 pts</span>
                  </div>
                  <div className="mb-3">
                    <Progress value={60} className="h-3" />
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 pt-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">5</div>
                    <div className="text-sm text-muted-foreground">Games Played</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">2</div>
                    <div className="text-sm text-muted-foreground">Achievements</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-amber-600">3</div>
                    <div className="text-sm text-muted-foreground">Badges Earned</div>
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
      </div>
    </MobileLayout>
  );

}
