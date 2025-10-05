import { useQuery } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import MobileLayout from "@/components/mobile-layout";
import PortfolioChart from "@/components/portfolio-chart";
import { SproutRequestForm } from "@/components/sprout-request-form";
import { PurchaseForChild } from "@/components/purchase-for-child";
import { ChildSelector } from "@/components/child-selector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpIcon, ArrowDownIcon, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import type { PortfolioHolding, Investment, Child } from "@shared/schema";
import { useEffect } from "react";

type EnrichedHolding = PortfolioHolding & { investment: Investment };

export default function Portfolio() {
  const [, params] = useRoute("/portfolio/:childId");
  const [, setLocation] = useLocation();
  const { user, contributor, contributorToken } = useAuth();
  const childId = params?.childId;

  // Fetch children that contributor has contributed to
  const { data: contributorGifts = [] } = useQuery<any[]>({
    queryKey: ["/api/contributors/gifts", contributor?.id],
    queryFn: async () => {
      if (!contributor?.id || !contributorToken) return [];
      
      const response = await fetch(`/api/contributors/${contributor.id}/gifts`, {
        headers: {
          'Authorization': `Bearer ${contributorToken}`,
        },
      });
      
      if (!response.ok) return [];
      return response.json();
    },
    enabled: !!contributor?.id && !!contributorToken && !user,
  });

  // Extract unique children from contributor gifts
  const contributedChildren = contributorGifts.reduce((acc: any[], gift: any) => {
    if (gift.child && !acc.find((c: any) => c.id === gift.child.id)) {
      acc.push(gift.child);
    }
    return acc;
  }, []);

  // Auto-redirect contributor to first child's portfolio if no childId
  useEffect(() => {
    if (contributor && !user && !childId && contributedChildren.length > 0) {
      setLocation(`/portfolio/${contributedChildren[0].id}`);
    }
  }, [contributor, user, childId, contributedChildren, setLocation]);

  // Fetch custodian's children
  const { data: userChildren = [] } = useQuery<any[]>({
    queryKey: ["/api/children", user?.id],
    enabled: !!user?.id,
  });

  // Auto-redirect custodian to first child's portfolio if no childId
  useEffect(() => {
    if (user && !childId && userChildren.length > 0) {
      setLocation(`/portfolio/${userChildren[0].id}`);
    }
  }, [user, childId, userChildren, setLocation]);

  const { data: child } = useQuery<Child>({
    queryKey: ["/api/children/by-id", childId],
    enabled: !!childId,
  });

  const { data: holdings = [], isLoading: loadingHoldings } = useQuery<EnrichedHolding[]>({
    queryKey: ["/api/portfolio", childId],
    enabled: !!childId,
  });

  const isLoading = loadingHoldings || (contributor && !user && contributorGifts === undefined);

  if (isLoading) {
    return (
      <MobileLayout currentTab="portfolio">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </MobileLayout>
    );
  }

  // Show message for custodians with no children yet
  if (user && !childId && userChildren.length === 0) {
    return (
      <MobileLayout currentTab="portfolio">
        <Card>
          <CardContent className="p-8 text-center">
            <User className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Children Added Yet</h3>
            <p className="text-muted-foreground mb-4">
              Add your first child to start building their investment portfolio.
            </p>
            <Button onClick={() => setLocation("/add-child")}>
              Add Your First Child
            </Button>
          </CardContent>
        </Card>
      </MobileLayout>
    );
  }

  // Show message for contributors with no contributions yet
  if (contributor && !user && !childId && contributedChildren.length === 0) {
    return (
      <MobileLayout currentTab="portfolio">
        <Card>
          <CardContent className="p-8 text-center">
            <User className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Portfolio to Display</h3>
            <p className="text-muted-foreground mb-4">
              You haven't contributed to any children yet. Send your first investment gift to see portfolio information here.
            </p>
            <Button onClick={() => setLocation("/")}>
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </MobileLayout>
    );
  }

  const totalValue = holdings.reduce((sum: number, holding: any) => 
    sum + parseFloat(holding.currentValue || "0"), 0
  );

  const totalCost = holdings.reduce((sum: number, holding: any) => 
    sum + (parseFloat(holding.shares || "0") * parseFloat(holding.averageCost || "0")), 0
  );

  const totalGain = totalValue - totalCost;
  const totalGainPercent = totalCost > 0 ? (totalGain / totalCost) * 100 : 0;

  return (
    <MobileLayout currentTab="portfolio">
      <div className="space-y-6">
        {/* Child Selector */}
        {childId && (
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Portfolio</h2>
            <ChildSelector currentChildId={childId} redirectPath="portfolio" />
          </div>
        )}

        {/* Portfolio Header */}
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl" data-testid="text-portfolio-value">
              ${totalValue.toFixed(2)}
            </CardTitle>
            <div className="flex items-center justify-center space-x-2">
              {totalGain >= 0 ? (
                <ArrowUpIcon className="w-4 h-4 text-success" />
              ) : (
                <ArrowDownIcon className="w-4 h-4 text-destructive" />
              )}
              <span 
                className={`font-semibold ${totalGain >= 0 ? 'text-success' : 'text-destructive'}`}
                data-testid="text-portfolio-gain"
              >
                ${Math.abs(totalGain).toFixed(2)} ({Math.abs(totalGainPercent).toFixed(1)}%)
              </span>
            </div>
          </CardHeader>
        </Card>

        {/* Portfolio Chart */}
        <PortfolioChart holdings={holdings} />

        {/* Action Buttons - Only for parents/custodians */}
        {user && childId && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <PurchaseForChild childId={childId} childName={child?.name || "Child"} />
            <SproutRequestForm childId={childId} childName={child?.name || "Child"} />
          </div>
        )}
        
        {/* Info for contributors */}
        {contributor && !user && childId && (
          <Card className="bg-muted">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground text-center">
                📊 Viewing portfolio as a contributor. Contact the parent to send additional gifts.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Holdings List */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Holdings</h2>
          {holdings.map((holding: EnrichedHolding) => {
            const currentValue = parseFloat(holding.currentValue || "0");
            const cost = parseFloat(holding.shares || "0") * parseFloat(holding.averageCost || "0");
            const gain = currentValue - cost;
            const gainPercent = cost > 0 ? (gain / cost) * 100 : 0;

            return (
              <Card key={holding.id} data-testid={`card-holding-${holding.id}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="font-bold text-lg">{holding.investment?.symbol}</h3>
                      <p className="text-sm text-muted-foreground">
                        {holding.investment?.name}
                      </p>
                    </div>
                    <Badge variant="secondary" className="capitalize">
                      {holding.investment?.type}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Shares</p>
                      <p className="font-semibold">{parseFloat(holding.shares).toFixed(4)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Avg Cost</p>
                      <p className="font-semibold">${parseFloat(holding.averageCost).toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Current Value</p>
                      <p className="font-semibold">${currentValue.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Gain/Loss</p>
                      <p className={`font-semibold ${gain >= 0 ? 'text-success' : 'text-destructive'}`}>
                        ${gain.toFixed(2)} ({gainPercent.toFixed(1)}%)
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {holdings.length === 0 && (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">No investments yet</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </MobileLayout>
  );
}
