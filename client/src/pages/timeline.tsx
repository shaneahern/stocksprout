import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import MobileLayout from "@/components/mobile-layout";
import { VideoPlayerModal } from "@/components/video-player-modal";
import { ChildSelector } from "@/components/child-selector";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Gift, PlayCircle, Heart, Sprout, Leaf, AlertCircle, User, Video } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Gift as GiftType, Investment, Contributor } from "@shared/schema";

type EnrichedGift = GiftType & { 
  investment: Investment;
  contributor?: Contributor | null;
  giftGiverProfileImageUrl?: string | null;
};

export default function Timeline() {
  const [, params] = useRoute("/timeline/:childId");
  const [, setLocation] = useLocation();
  const childId = params?.childId;
  const { toast } = useToast();
  const { user, token } = useAuth();
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [currentVideo, setCurrentVideo] = useState<{ url: string; giverName: string } | null>(null);

  // Fetch custodian's children first
  const { data: userChildren = [] } = useQuery<any[]>({
    queryKey: ["/api/children", user?.id],
    enabled: !!user?.id,
  });

  // Fetch children that user has contributed to (gifts they've given)
  const { data: userGifts = [] } = useQuery<any[]>({
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

  // Extract unique children from user's gifts (excluding own children)
  const contributedChildren = userGifts.reduce((acc: any[], gift: any) => {
    if (gift.child && !acc.find((c: any) => c.id === gift.child.id)) {
      // Only include if this is not one of the user's own children
      const isOwnChild = userChildren.some((child: any) => child.id === gift.child.id);
      if (!isOwnChild) {
        acc.push(gift.child);
      }
    }
    return acc;
  }, []);

  // Auto-redirect custodian to first child's timeline if no childId
  useEffect(() => {
    if (user && !childId && userChildren.length > 0) {
      setLocation(`/timeline/${userChildren[0].id}`);
    }
  }, [user, childId, userChildren, setLocation]);

  const { data: allGifts = [], isLoading } = useQuery<EnrichedGift[]>({
    queryKey: ["/api/gifts", childId],
    enabled: !!childId,
  });

  // Determine if this is the user's own child or a contributed child
  const isOwnChild = userChildren.some((child: any) => child.id === childId);

  // Filter to show only approved gifts in timeline
  // For contributed children, only show gifts from this user
  const gifts = allGifts.filter((gift: any) => {
    if (gift.status !== 'approved') return false;
    if (isOwnChild) return true; // Custodians see all gifts
    return gift.contributorId === user?.id; // Contributors only see their own gifts
  });
  
  const pendingGifts = isOwnChild 
    ? allGifts.filter((gift: any) => gift.status === 'pending')
    : []; // Contributors don't see pending gifts for other children

  const isLoadingData = isLoading;

  if (isLoadingData) {
    return (
      <MobileLayout currentTab="timeline">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </MobileLayout>
    );
  }

  // Show message for custodians with no children yet
  if (user && !childId && userChildren.length === 0) {
    return (
      <MobileLayout currentTab="timeline">
        <Card>
          <CardContent className="p-8 text-center">
            <User className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Children Added Yet</h3>
            <p className="text-muted-foreground mb-4">
              Add your first child to start tracking their investment timeline.
            </p>
            <Button onClick={() => setLocation("/add-child")}>
              Add Your First Child
            </Button>
          </CardContent>
        </Card>
      </MobileLayout>
    );
  }

  // Show message if user has no timeline to display
  if (user && !childId && userChildren.length === 0 && contributedChildren.length === 0) {
    return (
      <MobileLayout currentTab="timeline">
        <Card>
          <CardContent className="p-8 text-center">
            <User className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Timeline to Display</h3>
            <p className="text-muted-foreground mb-4">
              Add your own children or contribute to someone's investment account to see timelines here.
            </p>
            <Button onClick={() => setLocation("/")}>
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </MobileLayout>
    );
  }

  const handlePlayVideo = (videoUrl: string, giverName: string) => {
    setCurrentVideo({ url: videoUrl, giverName }); 
    setVideoModalOpen(true);
  };

  const handleSendThankYou = async (giftId: string) => {
    const message = prompt("Write a thank you message:");
    if (!message) return;
    
    try {
      const response = await apiRequest("POST", "/api/thank-you", {
        giftId,
        message
      });
      
      if (response.ok) {
        // Invalidate gifts query to refresh the data
        queryClient.invalidateQueries({ queryKey: ["/api/gifts", childId] });
        
        toast({
          title: "Thank You Sent!",
          description: "Your thank you message has been sent successfully.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send thank you message.",
        variant: "destructive",
      });
    }
  };

  // Sort gifts chronologically for growth calculation (oldest first)
  const chronologicalGifts = [...gifts].sort((a, b) => 
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  // Calculate cumulative amounts for growth visualization
  const giftsWithCumulative = chronologicalGifts.map((gift, index) => {
    const cumulativeAmount = chronologicalGifts
      .slice(0, index + 1)
      .reduce((sum, g) => sum + parseFloat(g.amount), 0);
    return { ...gift, cumulativeAmount, giftIndex: index };
  });

  const maxCumulative = giftsWithCumulative.length > 0 
    ? Math.max(...giftsWithCumulative.map(g => g.cumulativeAmount))
    : 0;

  // Sort for display (most recent first)
  const sortedGifts = [...gifts].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <MobileLayout currentTab="timeline">
      {/* Video Player Modal */}
      {currentVideo && (
        <VideoPlayerModal
          isOpen={videoModalOpen}
          onClose={() => {
            setVideoModalOpen(false);
            setCurrentVideo(null);
          }}
          videoUrl={currentVideo.url}
          giftGiverName={currentVideo.giverName}
        />
      )}
      
      <div className="space-y-6 pb-16">
        {/* Child Selector */}
        {childId && (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                <Sprout className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold">Growth Timeline</h1>
              </div>
            </div>
            <ChildSelector currentChildId={childId} redirectPath="timeline" />
          </div>
        )}

        {/* Pending Gifts Alert - Only for custodians */}
        {user && pendingGifts.length > 0 && (
          <Card className="border-orange-500 bg-orange-50">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-orange-600" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-orange-900">
                    {pendingGifts.length} gift{pendingGifts.length > 1 ? 's' : ''} waiting for your review
                  </p>
                  <p className="text-xs text-orange-700">
                    Click the notification bell to approve or reject
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Growing Sprout Timeline */}
        {gifts.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sprout className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-muted-foreground font-medium mb-2">No gifts yet — plant the first seed!</p>
              <p className="text-xs text-muted-foreground">Share your gift link to start growing</p>
            </CardContent>
          </Card>
        ) : (
          <div className="flex gap-6">
            {/* Left: Growing Sprout Visualization */}
            <div className="w-20 flex-shrink-0 relative">
              <div className="relative h-full">
                {/* Vertical Stem */}
                <div 
                  className="absolute left-1/2 transform -translate-x-1/2 bg-green-700 transition-all duration-1000 ease-out"
                  style={{ 
                    width: '4px',
                    height: `${giftsWithCumulative.length * 300 + 200}px`,
                    borderRadius: '2px'
                  }}
                  data-testid="stem-sprout"
                />
                
                {/* Leaf Nodes for each gift */}
                {giftsWithCumulative.map((gift, index) => {
                  const yPosition = index * 300 + 120;
                  const isLeft = index % 2 === 0;
                  
                  return (
                    <div
                      key={gift.id}
                      className="absolute flex items-center transition-all duration-700 ease-out"
                      style={{
                        top: `${yPosition}px`,
                        left: isLeft ? '6px' : '30px',
                        transform: isLeft ? 'translateX(-100%)' : 'translateX(0)'
                      }}
                      data-testid={`node-gift-${gift.id}`}
                    >
                      {/* Leaf */}
                      <div className={`flex items-center ${isLeft ? 'flex-row-reverse' : 'flex-row'} gap-1`}>
                        <Leaf 
                          className={`w-5 h-5 text-green-500 transform ${isLeft ? 'scale-x-[-1]' : ''}`}
                        />
                        <div className="w-3 h-0.5 bg-green-600" />
                      </div>
                      
                      {/* Cumulative Amount Label */}
                      <div 
                        className={`absolute ${isLeft ? 'right-8' : 'left-8'} top-1/2 transform -translate-y-1/2`}
                        data-testid={`text-cumulative-${gift.id}`}
                      >
                        <div className="bg-green-50 border border-green-200 rounded-lg px-2 py-1 whitespace-nowrap">
                          <div className="text-xs font-bold text-green-800">
                            ${gift.cumulativeAmount.toFixed(0)}
                          </div>
                          <div className="text-xs text-green-600">
                            Total
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Right: Gift Details */}
            <div className="flex-1 space-y-8">
              {giftsWithCumulative.map((gift: EnrichedGift, index: number) => (
                <Card key={gift.id} className="relative overflow-hidden" data-testid={`card-gift-${gift.id}`}>
                  {/* Video Indicator Badge - Clickable */}
                  {gift.videoMessageUrl && (
                    <button
                      onClick={() => handlePlayVideo(gift.videoMessageUrl!, gift.giftGiverName)}
                      className="absolute top-2 right-2 z-10 transition-transform hover:scale-105"
                      title="Click to play video message"
                    >
                      <Badge className="bg-purple-500 hover:bg-purple-600 text-white flex items-center gap-1 px-2 py-1 cursor-pointer shadow-md">
                        <PlayCircle className="w-3 h-3" />
                        <span className="text-xs">Video</span>
                      </Badge>
                    </button>
                  )}
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      {(gift.contributor?.profileImageUrl || gift.giftGiverProfileImageUrl) ? (
                        <Avatar className="w-10 h-10 flex-shrink-0">
                          <AvatarImage 
                            src={gift.contributor?.profileImageUrl || gift.giftGiverProfileImageUrl || undefined} 
                            alt={gift.contributor?.name || gift.giftGiverName}
                            className="object-cover"
                          />
                          <AvatarFallback className={`text-white text-sm font-semibold ${
                            gift.contributor?.phone === null ? 
                              'bg-gradient-to-br from-blue-500 to-blue-600' : // Parent purchase
                              'bg-gradient-to-br from-green-500 to-green-600' // External gift
                          }`}>
                            {(gift.contributor?.name || gift.giftGiverName).split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      ) : (
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                          gift.contributor?.phone === null ? 
                            'bg-gradient-to-br from-blue-500 to-blue-600' : // Parent purchase (no phone = user)
                            'bg-gradient-to-br from-green-500 to-green-600' // External gift
                        }`}>
                          {gift.contributor?.phone === null ? (
                            <User className="w-5 h-5 text-white" />
                          ) : (
                            <Gift className="w-5 h-5 text-white" />
                          )}
                        </div>
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-2">
                          <h3 className={`font-bold text-base ${gift.videoMessageUrl ? 'pr-16 sm:pr-0' : ''}`}>
                            {gift.contributor?.phone === null ? 
                              `Investment by ${gift.giftGiverName}` : // Parent purchase
                              `From ${gift.giftGiverName}` // External gift
                            }
                          </h3>
                          <Badge variant="outline" className={`text-xs w-fit ${gift.videoMessageUrl ? 'mr-20 sm:mr-0' : ''}`}>
                            {formatDistanceToNow(new Date(gift.createdAt), { addSuffix: true })}
                          </Badge>
                        </div>
                        
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
                          <div className="flex justify-between items-center gap-2 mb-1">
                            <span className="font-semibold text-sm">
                              {gift.investment?.name} ({gift.investment?.symbol})
                            </span>
                            <span className="font-bold text-sm text-green-700">${parseFloat(gift.amount).toFixed(2)}</span>
                          </div>
                          <div className="text-xs text-green-600">
                            {parseFloat(gift.shares).toFixed(4)} shares
                          </div>
                        </div>
                        
                        {gift.message && (
                          <div className="bg-card border rounded-lg p-3 mb-3">
                            <p className="text-sm italic">"{gift.message}"</p>
                          </div>
                        )}
                        
                        <div className="flex flex-col sm:flex-row gap-2">
                          {user && !gift.thankYouSent && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleSendThankYou(gift.id)}
                              className="text-xs"
                              data-testid={`button-thank-you-${gift.id}`}
                            >
                              <Heart className="w-4 h-4 mr-2" />
                              Say Thanks
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </MobileLayout>
  );
}
