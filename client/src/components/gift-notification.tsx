import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Gift, X, Eye, Heart } from "lucide-react";

// Mock parent ID - in a real app this would come from authentication
const MOCK_PARENT_ID = "parent-1";

type EnrichedGift = {
  id: string;
  childId: string;
  giftGiverName: string;
  giftGiverEmail?: string;
  amount: string;
  message?: string;
  videoMessageUrl?: string;
  createdAt: string;
  isViewed: boolean;
  thankYouSent: boolean;
  investment: {
    id: string;
    symbol: string;
    name: string;
    type: string;
    currentPrice: string;
    ytdReturn: string;
  };
};

export default function GiftNotification() {
  const [isVisible, setIsVisible] = useState(true);
  const [, setLocation] = useLocation();

  // Mock parent ID - in a real app this would come from authentication
  const MOCK_PARENT_ID = "parent-1";

  // Fetch children to get recent gifts
  const { data: children = [] } = useQuery<any[]>({
    queryKey: ["/api/children", MOCK_PARENT_ID],
  });

  // Fetch recent gifts for all children
  const { data: allGifts = [], isLoading: giftsLoading } = useQuery<any[]>({
    queryKey: ["/api/all-gifts", children.map(c => c.id)],
    queryFn: async () => {
      if (children.length === 0) return [];
      const giftPromises = children.map((child: any) => 
        fetch(`/api/gifts/${child.id}`).then(res => res.json())
      );
      const giftArrays = await Promise.all(giftPromises);
      return giftArrays.flat().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    },
    enabled: children.length > 0,
  });

  // Get the most recent unviewed gift
  const recentGift = allGifts.find((gift: any) => !gift.isViewed) || null;



  const handleDismiss = () => {
    setIsVisible(false);
  };

  const handleViewGift = () => {
    if (recentGift) {
      setLocation(`/timeline/${recentGift.childId}`);
    }
  };

  const handleSendThankYou = () => {
    if (recentGift) {
      setLocation(`/timeline/${recentGift.childId}`);
    }
  };

  if (!isVisible || !recentGift) {
    return null;
  }

  return (
    <Card className="gift-card celebration-animation border-0 bg-transparent">
      <CardContent className="p-6 bg-transparent">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
              <Gift className="w-6 h-6 text-secondary" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">New Gift Received!</h3>
              <p className="text-white text-sm font-medium">From {recentGift.giftGiverName}</p>
            </div>
          </div>
          <button 
            onClick={handleDismiss}
            className="text-white/80 hover:text-white transition-colors"
            data-testid="button-dismiss-notification"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="bg-white/20 rounded-lg p-4 mb-4">
          <div className="flex justify-between items-start mb-2">
            <span className="text-white font-semibold text-base">
              {recentGift.investment.name} ({recentGift.investment.symbol})
            </span>
            <span className="text-white font-bold text-base">${parseFloat(recentGift.amount).toFixed(0)}</span>
          </div>
          <p className="text-white text-sm leading-relaxed">"{recentGift.message}"</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <Button 
            onClick={handleViewGift}
            className="flex-1 bg-white text-secondary font-semibold hover:bg-white/90 text-sm sm:text-base"
            data-testid="button-view-gift"
          >
            <Eye className="w-4 h-4 mr-2" />
            View Gift
          </Button>
          <Button 
            onClick={handleSendThankYou}
            className="flex-1 bg-white/20 text-white font-semibold hover:bg-white/30 border-0 text-sm sm:text-base"
            variant="outline"
            data-testid="button-send-thanks"
          >
            <Heart className="w-4 h-4 mr-2" />
            Say Thanks
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
