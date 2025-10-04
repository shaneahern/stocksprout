import { useQuery } from "@tanstack/react-query";
import MobileLayout from "@/components/mobile-layout";
import GiftNotification from "@/components/gift-notification";
import ChildCard from "@/components/child-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Link2, History } from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";

export default function Home() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  const { data: children = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/children", user?.id],
    enabled: !!user?.id,
  });

  const handleAddChild = () => {
    setLocation("/add-child");
  };

  const handleCreateGiftLink = () => {
    if (children.length === 0) {
      setLocation("/add-child");
      return;
    }
    // Navigate to the first child's details to generate a gift link
    setLocation(`/portfolio/${children[0].id}`);
  };

  const handleViewTimeline = () => {
    if (children.length === 0) {
      setLocation("/add-child");
      return;
    }
    setLocation(`/timeline/${children[0].id}`);
  };

  if (isLoading) {
    return (
      <MobileLayout currentTab="home">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </MobileLayout>
    );
  }

  // Calculate total portfolio value
  const totalValue = children.reduce((sum: number, child: any) => sum + (child.totalValue || 0), 0);
  const totalGrowth = children.reduce((sum: number, child: any) => sum + (child.totalGain || 0), 0);

  return (
    <MobileLayout currentTab="home">
      <div className="space-y-6">
        {/* Recent Gift Notification */}
        <GiftNotification />

        {/* Children Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-foreground">Your Children</h2>
            <Button 
              onClick={handleAddChild}
              variant="ghost" 
              className="text-primary font-semibold"
              data-testid="button-add-child"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Child
            </Button>
          </div>

          <div className="space-y-4">
            {children.map((child: any) => (
              <ChildCard key={child.id} child={child} />
            ))}
            
            {children.length === 0 && (
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-muted-foreground mb-4">No children added yet</p>
                  <Button onClick={handleAddChild} data-testid="button-add-first-child">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Child
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-foreground mb-3 sm:mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <Button 
              onClick={handleCreateGiftLink}
              className="bg-primary text-primary-foreground p-3 sm:p-4 h-auto flex-col"
              data-testid="button-create-gift-link"
            >
              <Link2 className="w-5 h-5 sm:w-6 sm:h-6 mb-1 sm:mb-2" />
              <span className="font-semibold text-xs sm:text-sm">Create Gift Link</span>
            </Button>
            <Button 
              onClick={handleViewTimeline}
              className="bg-accent text-accent-foreground p-3 sm:p-4 h-auto flex-col"
              data-testid="button-view-timeline"
            >
              <History className="w-5 h-5 sm:w-6 sm:h-6 mb-1 sm:mb-2" />
              <span className="font-semibold text-xs sm:text-sm">View Timeline</span>
            </Button>
          </div>
        </div>

        {/* Portfolio Summary */}
        {children.length > 0 && (
          <Card className="portfolio-growth text-white">
            <CardContent className="p-6">
              <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Family Portfolio Summary</h2>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <p className="text-white/80 text-xs sm:text-sm">Total Value</p>
                  <p className="text-xl sm:text-2xl font-bold" data-testid="text-total-value">
                    ${totalValue.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-white/80 text-xs sm:text-sm">Total Growth</p>
                  <p className="text-xl sm:text-2xl font-bold" data-testid="text-total-growth">
                    +${totalGrowth.toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="mt-3 sm:mt-4 bg-white/20 rounded-lg p-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-white/90">This Month's Performance</span>
                  <span className="font-bold text-sm sm:text-base">+10.8%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </MobileLayout>
  );
}
