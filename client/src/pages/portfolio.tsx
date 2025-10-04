import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import MobileLayout from "@/components/mobile-layout";
import PortfolioChart from "@/components/portfolio-chart";
import { SproutRequestForm } from "@/components/sprout-request-form";
import { PurchaseForChild } from "@/components/purchase-for-child";
import { ChildSelector } from "@/components/child-selector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUpIcon, ArrowDownIcon } from "lucide-react";
import type { PortfolioHolding, Investment, Child } from "@shared/schema";

type EnrichedHolding = PortfolioHolding & { investment: Investment };

export default function Portfolio() {
  const [, params] = useRoute("/portfolio/:childId");
  const childId = params?.childId;

  const { data: child } = useQuery<Child>({
    queryKey: ["/api/children/by-id", childId],
    enabled: !!childId,
  });

  const { data: holdings = [], isLoading } = useQuery<EnrichedHolding[]>({
    queryKey: ["/api/portfolio", childId],
    enabled: !!childId,
  });

  if (isLoading) {
    return (
      <MobileLayout currentTab="portfolio">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
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

        {/* Action Buttons */}
        {childId && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <PurchaseForChild childId={childId} childName={child?.name || "Child"} />
            <SproutRequestForm childId={childId} childName={child?.name || "Child"} />
          </div>
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
