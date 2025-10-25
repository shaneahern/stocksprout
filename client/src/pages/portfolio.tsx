import { useQuery } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import MobileLayout from "@/components/mobile-layout";
import PortfolioGrowthChart from "@/components/portfolio-growth-chart";
import { ChildSelector } from "@/components/child-selector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpIcon, ArrowDownIcon, User, Gift, Clock, AlertCircle, UserPlus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import type { PortfolioHolding, Investment, Child } from "@shared/schema";
import { useEffect } from "react";
import { getStockLogoUrl, getFallbackLogoUrl } from "@/lib/stock-logo";

type EnrichedHolding = PortfolioHolding & { investment: Investment };

export default function Portfolio() {
  const [, params] = useRoute("/portfolio/:childId");
  const [, setLocation] = useLocation();
  const { user, token } = useAuth();
  const childId = params?.childId;

  // Fetch custodian's children first
  const { data: userChildren = [] } = useQuery<any[]>({
    queryKey: ["/api/children", user?.id],
    enabled: !!user?.id,
  });

  // Fetch children that user has contributed to (gifts they've given)
  const { data: contributorGifts = [] } = useQuery<any[]>({
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

  // Extract unique children from contributor gifts (excluding own children)
  const contributedChildren = contributorGifts.reduce((acc: any[], gift: any) => {
    if (gift.child && !acc.find((c: any) => c.id === gift.child.id)) {
      // Only include if this is not one of the user's own children
      const isOwnChild = userChildren.some((child: any) => child.id === gift.child.id);
      if (!isOwnChild) {
        acc.push(gift.child);
      }
    }
    return acc;
  }, []);

  // Auto-redirect to first contributed child's portfolio if no childId and no own children
  useEffect(() => {
    if (!childId && contributedChildren.length > 0) {
      setLocation(`/portfolio/${contributedChildren[0].id}`);
    }
  }, [childId, contributedChildren, setLocation]);

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

  const { data: allHoldings = [], isLoading: loadingHoldings } = useQuery<EnrichedHolding[]>({
    queryKey: ["/api/portfolio", childId],
    enabled: !!childId,
  });


  // Fetch gifts for this child to determine which investments are from this user
  const { data: childGifts = [] } = useQuery<any[]>({
    queryKey: ["/api/gifts", childId],
    enabled: !!childId,
  });

  // Determine if this is the user's own child or a contributed child
  const isOwnChild = userChildren.some((child: any) => child.id === childId);
  
  // Get pending gifts for this user (contributor's own pending gifts)
  const userPendingGifts = isOwnChild 
    ? childGifts.filter((gift: any) => gift.status === 'pending')
    : childGifts.filter((gift: any) => 
        gift.contributorId === user?.id && gift.status === 'pending'
      );
  
  // Filter holdings: if viewing a contributed child, recalculate based on user's gifts only
  const holdings = (isOwnChild ? allHoldings : allHoldings
    .filter((holding: any) => {
      // Check if this investment came from a gift by this user
      return childGifts.some((gift: any) => 
        gift.contributorId === user?.id && gift.investmentId === holding.investmentId
      );
    })
    .map((holding: any) => {
      // Recalculate shares and values based on only user's gifts
      const userGiftsForInvestment = childGifts.filter((gift: any) => 
        gift.contributorId === user?.id && 
        gift.investmentId === holding.investmentId &&
        gift.status === 'approved'
      );
      
      const totalUserShares = userGiftsForInvestment.reduce((sum: number, gift: any) => 
        sum + parseFloat(gift.shares || "0"), 0
      );
      
      const totalUserCost = userGiftsForInvestment.reduce((sum: number, gift: any) => 
        sum + parseFloat(gift.amount || "0"), 0
      );
      
      const avgCost = totalUserShares > 0 ? totalUserCost / totalUserShares : 0;
      const currentValue = totalUserShares * parseFloat(holding.investment?.currentPrice || holding.currentPrice || "0");
      
      return {
        ...holding,
        shares: totalUserShares.toFixed(6),
        averageCost: avgCost.toFixed(2),
        currentValue: currentValue.toFixed(2),
      };
    }))
    .filter((holding: any) => {
      // Filter out holdings with 0 value (from pending gifts not yet approved)
      return parseFloat(holding.currentValue || "0") > 0;
    });

  const isLoading = loadingHoldings || contributorGifts === undefined;

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

  // Show message if no child is selected and user has no children
  if (!childId && contributedChildren.length === 0 && userChildren.length === 0) {
    return (
      <MobileLayout currentTab="portfolio">
        <Card>
          <CardContent className="p-8 text-center">
            <User className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Portfolio to Display</h3>
            <p className="text-muted-foreground mb-4">
              You haven't added any children or contributed to any children yet.
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

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>, symbol: string) => {
    const target = e.currentTarget;
    // Prevent infinite loop if fallback also fails
    if (!target.src.startsWith('data:')) {
      target.src = getFallbackLogoUrl(symbol);
    }
  };

  return (
    <MobileLayout currentTab="portfolio">
      <div className="space-y-6 pb-16">
        {childId && (
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="text-lg font-bold mb-1" data-testid="text-portfolio-value">
                ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="flex items-center gap-2">
                <span 
                  className="text-sm font-semibold"
                  style={{ color: '#AAAAAA' }}
                  data-testid="text-portfolio-gain"
                >
                  {totalGain >= 0 ? '+' : ''}${totalGain.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Total Gain
                </span>
              </div>
            </div>
            <ChildSelector currentChildId={childId} redirectPath="portfolio" />
          </div>
        )}
        {!childId && (
          <div>
            <div className="text-center mb-6">
              <div className="text-lg font-bold mb-2" data-testid="text-portfolio-value">
                ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="flex items-center justify-center gap-2">
                <span 
                  className="text-sm font-semibold"
                  style={{ color: '#AAAAAA' }}
                  data-testid="text-portfolio-gain"
                >
                  {totalGain >= 0 ? '+' : ''}${totalGain.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Total Gain
                </span>
              </div>
            </div>
          </div>
        )}


        <PortfolioGrowthChart 
          currentValue={totalValue} 
          ytdReturn={totalGainPercent}
        />
        
        {/* Pending Gifts Alert - Different messages for custodians vs contributors */}
        {userPendingGifts.length > 0 && (
          <Card className="border-amber-500 bg-amber-50">
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-amber-600 mt-0.5" />
                <div className="flex-1">
                  {isOwnChild ? (
                    <>
                      <p className="text-sm font-semibold text-amber-900 mb-2">
                        {userPendingGifts.length} gift{userPendingGifts.length > 1 ? 's' : ''} waiting for your review
                      </p>
                      <div className="space-y-2">
                        {userPendingGifts.map((gift: any) => (
                          <div key={gift.id} className="bg-white/50 rounded p-2 text-xs">
                            <div className="flex justify-between items-center">
                              <span className="font-medium">{gift.investment?.name || 'Investment'}</span>
                              <span className="font-semibold">${parseFloat(gift.amount).toFixed(2)}</span>
                            </div>
                            <div className="text-amber-700 mt-1">
                              From {gift.giftGiverName} • Awaiting your review
                            </div>
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-amber-700 mt-2">
                        Click the notification bell to approve or reject
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm font-semibold text-amber-900 mb-2">
                        {userPendingGifts.length} gift{userPendingGifts.length > 1 ? 's' : ''} pending approval
                      </p>
                      <div className="space-y-2">
                        {userPendingGifts.map((gift: any) => (
                          <div key={gift.id} className="bg-white/50 rounded p-2 text-xs">
                            <div className="flex justify-between items-center">
                              <span className="font-medium">{gift.investment?.name || 'Investment'}</span>
                              <span className="font-semibold">${parseFloat(gift.amount).toFixed(2)}</span>
                            </div>
                            <div className="text-amber-700 mt-1">
                              Awaiting custodian approval
                            </div>
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-amber-700 mt-2">
                        These investments will appear in the portfolio once approved by the custodian.
                      </p>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons - Only for parents/custodians */}
        {user && childId && (
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 -mt-2 mb-2">
            <Button 
              onClick={() => setLocation(`/gift/${child?.giftLinkCode}`)}
              className="flex-1 text-white font-semibold text-sm sm:text-base hover:opacity-90 py-1"
              style={{ backgroundColor: '#328956' }}
            >
              <Gift className="w-4 h-4 mr-2" />
              Send Gift
            </Button>
            <Button 
              onClick={() => {
                // Generate sprout request link
                const generateLink = async () => {
                  try {
                    const response = await fetch('/api/generate-gift-link', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                      },
                      body: JSON.stringify({ childId }),
                    });
                    const data = await response.json();
                    
                    // Use the same SMS sharing logic as the child card
                    const smsMessage = `🎁 You're invited to send a gift to ${child?.name}! Give the gift of investment: ${data.giftLink}`;
                    try {
                      await navigator.share({
                        title: `Send a gift to ${child?.name}`,
                        text: smsMessage,
                        url: data.giftLink
                      });
                    } catch (error) {
                      // Fallback - copy to clipboard
                      await navigator.clipboard.writeText(smsMessage);
                    }
                  } catch (error) {
                    console.error('Failed to generate gift link:', error);
                  }
                };
                generateLink();
              }}
              className="flex-1 text-white font-semibold text-sm sm:text-base hover:opacity-90 py-1"
              style={{ backgroundColor: '#8A3324' }}
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Sprout Request
            </Button>
          </div>
        )}
        
        {/* Send Gift Button - when viewing a child you've contributed to (not your own child) */}
        {childId && contributedChildren.some((c: any) => c.id === childId) && !userChildren.some((c: any) => c.id === childId) && (
          <div className="flex flex-col gap-2 -mt-2 mb-2">
            <Button 
              onClick={() => setLocation(`/gift/${child?.giftLinkCode}`)}
              className="flex-1 text-white font-semibold text-sm sm:text-base hover:opacity-90 py-1"
              style={{ backgroundColor: '#328956' }}
            >
              <Gift className="w-4 h-4 mr-2" />
              Send Another Gift to {child?.name}
            </Button>
          </div>
        )}

        <div className="space-y-2">
          <h2 className="text-lg font-bold">Holdings</h2>
          {holdings.map((holding: EnrichedHolding) => {
            const currentValue = parseFloat(holding.currentValue || "0");
            const cost = parseFloat(holding.shares || "0") * parseFloat(holding.averageCost || "0");
            const gain = currentValue - cost;
            const gainPercent = cost > 0 ? (gain / cost) * 100 : 0;

            return (
              <Card key={holding.id} data-testid={`card-holding-${holding.id}`} className="border-0 shadow-none">
                <CardContent className="p-0">
                  <div className="flex items-center justify-between py-3 px-2">
                    <div className="flex items-center gap-4 flex-1">
                      {holding.investment?.symbol ? (
                        <>
                          <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
                            <img 
                              src={getStockLogoUrl(holding.investment.symbol, holding.investment.name)}
                              alt={`${holding.investment.symbol} logo`}
                              className="w-full h-full object-contain p-1"
                              onError={(e) => handleImageError(e, holding.investment.symbol)}
                            />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-lg">{holding.investment.symbol}</div>
                            <div className="text-sm text-muted-foreground">
                              {parseFloat(holding.shares).toFixed(0)} shares
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="flex items-center gap-4 flex-1">
                          <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 text-xl font-bold text-muted-foreground">
                            ?
                          </div>
                          <div className="flex-1">
                            <div className="font-bold text-lg">Unknown</div>
                            <div className="text-sm text-muted-foreground">No data</div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="text-right flex-shrink-0 ml-4">
                      <div className="font-bold text-lg">
                        ${currentValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        +${gain.toFixed(2)}
                      </div>
                    </div>

                    <div 
                      className="ml-4 px-4 py-2 rounded-lg font-bold text-lg text-white"
                      style={{ 
                        backgroundColor: gain >= 0 ? '#34A853' : '#EF5252'
                      }}
                    >
                      {gainPercent >= 0 ? '+' : ''}{gainPercent.toFixed(2)}%
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
