import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { TrendingUp, Share2, Gift } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { generateSMSMessage, shareViaWebShare } from "@/lib/sms-utils";

interface ChildCardProps {
  child: any;
}

export default function ChildCard({ child }: ChildCardProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const generateLinkMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/generate-gift-link", {
        childId: child.id
      });
      return response.json();
    },
    onSuccess: async (data) => {
      const smsMessage = generateSMSMessage(data.childName, data.giftLink);
      try {
        await shareViaWebShare({
          title: `Send a gift to ${data.childName}`,
          text: smsMessage,
          url: data.giftLink
        });
        toast({
          title: "Share Menu Opened!",
          description: `Choose how you want to share the gift link for ${child.name}.`,
        });
      } catch (error) {
        // Fallback if sharing failed or was cancelled
        toast({
          title: "Share Ready",
          description: `Gift link generated for ${child.name}. Use the share options to send it via SMS.`,
        });
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to generate gift link.",
        variant: "destructive",
      });
    },
  });

  const handleViewPortfolio = () => {
    setLocation(`/portfolio/${child.id}`);
  };

  const handleShareGiftLink = () => {
    generateLinkMutation.mutate();
  };

  // Fetch real portfolio data
  const { data: portfolioData = [] } = useQuery<any[]>({
    queryKey: ["/api/portfolio", child.id],
  });

  const { data: gifts = [] } = useQuery<any[]>({
    queryKey: ["/api/gifts", child.id],
  });

  // Calculate real portfolio stats
  const totalValue = portfolioData.reduce((sum, holding) => sum + parseFloat(holding.currentValue || 0), 0);
  const totalCost = portfolioData.reduce((sum, holding) => {
    const shares = parseFloat(holding.shares || 0);
    const avgCost = parseFloat(holding.averageCost || 0);
    return sum + (shares * avgCost);
  }, 0);
  const totalGain = totalValue - totalCost;
  const monthlyGrowth = totalValue > 0 ? ((totalGain / totalCost) * 100).toFixed(1) : "0.0";

  const portfolioStats = {
    totalValue: totalValue,
    giftsCount: gifts.filter((g: any) => g.status === 'approved').length, // Only count approved gifts
    investmentsCount: portfolioData.length,
    totalGain: Math.max(0, totalGain),
    monthlyGrowth: monthlyGrowth
  };

  return (
    <Card className="border border-border shadow-sm" data-testid={`card-child-${child.id}`}>
      <CardContent className="p-5">
        <div className="flex items-center space-x-4 mb-4">
          <Avatar className="w-16 h-16 border-2 border-primary/20">
            <AvatarFallback className="text-lg font-bold">
              {child.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="font-bold text-lg text-foreground">{child.name}</h3>
            <p className="text-muted-foreground text-sm">Age {child.age}</p>
            <div className="flex items-center space-x-2 mt-1">
              <div className="w-2 h-2 bg-success rounded-full"></div>
              <span className="text-success text-sm font-medium">
                +{portfolioStats.monthlyGrowth}% growth
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-foreground" data-testid={`text-child-value-${child.id}`}>
              ${portfolioStats.totalValue.toLocaleString()}
            </p>
            <p className="text-muted-foreground text-sm">Total Portfolio</p>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4">
          <div className="bg-muted rounded-lg p-2 sm:p-3 text-center">
            <p className="text-xs text-muted-foreground mb-1">Gifts Received</p>
            <p className="font-bold text-foreground text-sm sm:text-base">{portfolioStats.giftsCount}</p>
          </div>
          <div className="bg-muted rounded-lg p-2 sm:p-3 text-center">
            <p className="text-xs text-muted-foreground mb-1">Investments</p>
            <p className="font-bold text-foreground text-sm sm:text-base">{portfolioStats.investmentsCount}</p>
          </div>
          <div className="bg-muted rounded-lg p-2 sm:p-3 text-center">
            <p className="text-xs text-muted-foreground mb-1">Total Gain</p>
            <p className="font-bold text-success text-sm sm:text-base">+${portfolioStats.totalGain.toFixed(0)}</p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <Button 
            onClick={handleViewPortfolio}
            className="flex-1 bg-primary text-primary-foreground font-semibold text-sm sm:text-base"
            data-testid={`button-view-portfolio-${child.id}`}
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            View Portfolio
          </Button>
          <Button 
            onClick={handleShareGiftLink}
            disabled={generateLinkMutation.isPending}
            className="flex-1 bg-secondary text-secondary-foreground font-semibold text-sm sm:text-base"
            data-testid={`button-share-link-${child.id}`}
          >
            <Share2 className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">{generateLinkMutation.isPending ? "Generating..." : "Share Gift Link"}</span>
            <span className="sm:hidden">{generateLinkMutation.isPending ? "..." : "Share Link"}</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
