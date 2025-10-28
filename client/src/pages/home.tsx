import { useQuery } from "@tanstack/react-query";
import MobileLayout from "@/components/mobile-layout";
import GiftNotification from "@/components/gift-notification";
import ChildCard from "@/components/child-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Gift } from "lucide-react";
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
  // Calculate total contributed and pending count per child (excluding rejected gifts)
  const contributedChildren = contributorGifts.reduce((acc: any[], gift: any) => {
    if (gift.child) {
      const isOwnChild = children.some((child: any) => child.id === gift.child.id);
      if (!isOwnChild) {
        // Find existing child in accumulator
        let existingChild = acc.find((c: any) => c.id === gift.child.id);

        if (!existingChild) {
          // Create new entry for this child
          existingChild = {
            id: gift.child.id,
            firstName: gift.child.firstName,
            lastName: gift.child.lastName,
            name: gift.child.name, // Keep for backwards compatibility
            giftLinkCode: gift.child.giftCode,
            profileImageUrl: gift.child.profileImageUrl,
            birthdate: gift.child.birthdate,
            age: gift.child.age, // Keep for backwards compatibility
            totalValue: 0, // This will be the sum of all gifts (excluding rejected)
            totalGain: 0,
            pendingCount: 0,
            approvedCount: 0,
          };
          acc.push(existingChild);
        }

        // Add this gift's amount to the child's total (only if not rejected)
        if (gift.status !== 'rejected') {
          existingChild.totalValue += parseFloat(gift.amount || '0');
        }

        // Track pending vs approved gifts
        if (gift.status === 'pending') {
          existingChild.pendingCount++;
        } else if (gift.status === 'approved') {
          existingChild.approvedCount++;
        }
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

        {/* Your Children Section - Only show if user is logged in */}
        {user && <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-[15px] font-semibold text-foreground">
              Your Sprouts
            </h2>
            {user && (
              <Button 
                onClick={handleAddChild}
                variant="ghost" 
                className="text-primary font-semibold py-1"
                data-testid="button-add-child"
              >
                <Plus className="w-4 h-4 mr-0.5" />
                Add Child
              </Button>
            )}
          </div>

          <div className="space-y-4">
            {children.length > 0 ? (
              children.map((child: any) => (
                <ChildCard key={child.id} child={child} />
              ))
            ) : user ? (
              <Card>
                <CardContent className="pt-6 pb-6 text-center">
                  <div className="max-w-md mx-auto">
                    <h3 className="text-lg font-semibold mb-2">No Sprouts Added Yet</h3>
                    <p className="text-muted-foreground text-sm">
                      Start building your child's investment portfolio by adding them to StockSprout.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : null}
          </div>
        </div>}

        {/* Children You've Contributed To - Always show with empty state if needed */}
        {user && (
          <div>
            <div className="mb-4">
              <h2 className="text-[15px] font-semibold text-foreground">Sprouts You've Helped</h2>
              <p className="text-sm text-muted-foreground">
                {contributedChildren.length > 0 
                  ? "View and send more gifts to these children" 
                  : "Start making a difference in other children's futures"}
              </p>
            </div>
            <div className="space-y-4">
              {contributedChildren.length > 0 ? (
                contributedChildren.map((child: any) => (
                  <ChildCard key={child.id} child={child} isContributedChild={true} />
                ))
              ) : (
                <div className="bg-white rounded-lg border border-border p-6 text-center">
                  <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Gift className="w-8 h-8 text-accent" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No Children Helped Yet</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    When other parents invite you to contribute through a Sprout Request, 
                    you'll be able to share investment gifts to their children. 
                    All children you've helped will be tracked here so you can watch their investments grow!
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </MobileLayout>
  );
}
