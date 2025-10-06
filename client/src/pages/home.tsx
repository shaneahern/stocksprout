import { useQuery } from "@tanstack/react-query";
import MobileLayout from "@/components/mobile-layout";
import GiftNotification from "@/components/gift-notification";
import ChildCard from "@/components/child-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";

export default function Home() {
  const [, setLocation] = useLocation();
  const { user, token } = useAuth();

  //Fetch custodian's children (children where user is parent)
  const { data: children = [], isLoading: loadingChildren } = useQuery<any[]>({
    queryKey: ["/api/children", user?.id],
    enabled: !!user?.id,
  });

  // Fetch children that user has contributed to (gifts they've given)
  const { data: contributorGifts = [], isLoading: loadingGifts } = useQuery<any[]>({
    queryKey: ["/api/contributors/gifts", user?.id],
    queryFn: async () => {
      if (!user?.id || !token) return [];
      
      const response = await fetch(`/api/contributors/${user.id}/gifts`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) return [];
      return response.json();
    },
    enabled: !!user?.id && !!token,
  });

  const isLoading = loadingChildren || loadingGifts;

  // Extract unique children from contributor gifts (excluding own children)
  const contributedChildren = contributorGifts.reduce((acc: any[], gift: any) => {
    if (gift.child && !acc.find((c: any) => c.id === gift.child.id)) {
      // Only include if this is not one of the user's own children
      const isOwnChild = children.some((child: any) => child.id === gift.child.id);
      if (!isOwnChild) {
        acc.push({
          id: gift.child.id,
          name: gift.child.name,
          giftLinkCode: gift.child.giftCode,
          profileImageUrl: gift.child.profileImageUrl,
          age: gift.child.age,
          totalValue: 0, // Contributors don't see portfolio values
          totalGain: 0,
        });
      }
    }
    return acc;
  }, []);

  const handleAddChild = () => {
    setLocation("/add-child");
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
      <div className="space-y-6 pb-16">
        {/* Recent Gift Notification - only for custodians */}
        {user && <GiftNotification />}

        {/* Your Children Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-foreground">
              {user ? "Your Children" : "Your Children / Sprouts"}
            </h2>
            {user && (
              <Button 
                onClick={handleAddChild}
                variant="ghost" 
                className="text-primary font-semibold"
                data-testid="button-add-child"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Child
              </Button>
            )}
          </div>

          <div className="space-y-4">
            {children.map((child: any) => (
              <ChildCard key={child.id} child={child} />
            ))}
            
            {children.length === 0 && (
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-muted-foreground mb-4">
                    {user ? "No children added yet" : "You haven't added any children yet"}
                  </p>
                  {user && (
                    <Button onClick={handleAddChild} data-testid="button-add-first-child">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Your First Child
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Children You've Contributed To */}
        {contributedChildren.length > 0 && (
          <div>
            <div className="mb-4">
              <h2 className="text-xl font-bold text-foreground">Children You've Helped</h2>
              <p className="text-sm text-muted-foreground">View and send more gifts to these children</p>
            </div>
            <div className="space-y-4">
              {contributedChildren.map((child: any) => (
                <ChildCard key={child.id} child={child} isContributedChild={true} />
              ))}
            </div>
          </div>
        )}

        {/* Portfolio Summary - only for custodians with children */}
        {user && children.length > 0 && (
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
