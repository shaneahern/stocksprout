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
import { Gift, PlayCircle, Heart, Sprout, Leaf, AlertCircle, User, Video, Clock, CheckCircle, ChevronDown } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Gift as GiftType, Investment, Contributor } from "@shared/schema";

type EnrichedGift = GiftType & { 
  investment: Investment;
  contributor?: Contributor | null;
  giftGiverProfileImageUrl?: string | null;
  cumulativeAmount?: number;
  giftIndex?: number;
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

  // Filter gifts based on view type
  // For contributed children, only show gifts from this user
  const gifts = allGifts.filter((gift: any) => {
    if (isOwnChild) return true; // Custodians see all gifts (approved and pending)
    return gift.contributorId === user?.id; // Contributors only see their own gifts
  });
  
  const pendingGifts = isOwnChild 
    ? allGifts.filter((gift: any) => gift.status === 'pending')
    : gifts.filter((gift: any) => gift.status === 'pending'); // Contributors see their pending gifts

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
        {/* Header - Growth Timeline */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Growth Timeline</h1>
          {childId && <ChildSelector currentChildId={childId} redirectPath="timeline" />}
        </div>

        {/* Full Video Reel Button */}
        {gifts.some(gift => gift.videoMessageUrl) && (
          <Button className="w-full bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-2 py-3 rounded-xl">
            <Leaf className="w-5 h-5" />
            <PlayCircle className="w-4 h-4" />
            Full Video Reel
          </Button>
        )}

        {/* Pending Gifts Alert - Only for custodians */}
        {user && isOwnChild && pendingGifts.length > 0 && (
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

        {/* Timeline */}
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
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-6 top-0 bottom-0 w-2 bg-green-700" />
            
            {/* Timeline Items */}
            <div className="space-y-6">
              {giftsWithCumulative.map((gift: EnrichedGift, index: number) => (
                <div key={gift.id} className="relative flex items-start gap-4">
                  {/* Timeline Node with Leaf */}
                  <div className="relative z-10 flex-shrink-0">
                    <div className="w-12 h-12 bg-white border-2 border-green-700 rounded-full flex items-center justify-center">
                      <Leaf className="w-6 h-6 text-green-700" />
                    </div>
                    {/* Cumulative Amount Tag */}
                    <div className="absolute -top-2 -right-2 bg-green-50 border border-green-200 rounded-lg px-2 py-1 whitespace-nowrap">
                      <div className="text-xs font-bold text-green-800">
                        ${gift.cumulativeAmount?.toFixed(0) || '0'} Total
                      </div>
                    </div>
                  </div>
                  
                  {/* Gift Card */}
                  <Card className="flex-1 shadow-sm border-0 bg-white">
                    <CardContent className="p-4">
                      {/* Header with Profile Picture and Video Button */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          {(gift.contributor?.profileImageUrl || gift.giftGiverProfileImageUrl) ? (
                            <Avatar className="w-10 h-10">
                              <AvatarImage 
                                src={gift.contributor?.profileImageUrl || gift.giftGiverProfileImageUrl || undefined} 
                                alt={gift.contributor?.name || gift.giftGiverName}
                                className="object-cover"
                              />
                              <AvatarFallback className={`text-white text-sm font-semibold ${
                                gift.contributor?.phone === null ? 
                                  'bg-gradient-to-br from-blue-500 to-blue-600' : 
                                  'bg-gradient-to-br from-green-500 to-green-600'
                              }`}>
                                {(gift.contributor?.name || gift.giftGiverName).split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                          ) : (
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              gift.contributor?.phone === null ? 
                                'bg-gradient-to-br from-blue-500 to-blue-600' : 
                                'bg-gradient-to-br from-green-500 to-green-600'
                            }`}>
                              {gift.contributor?.phone === null ? (
                                <User className="w-5 h-5 text-white" />
                              ) : (
                                <Gift className="w-5 h-5 text-white" />
                              )}
                            </div>
                          )}
                          <h3 className="font-bold text-gray-900">
                            {gift.contributor?.phone === null ? 
                              `Investment by ${gift.giftGiverName}` : 
                              `From ${gift.giftGiverName}`
                            }
                          </h3>
                        </div>
                        
                        {/* Video Button */}
                        {gift.videoMessageUrl && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handlePlayVideo(gift.videoMessageUrl!, gift.giftGiverName)}
                            className="bg-blue-500 hover:bg-blue-600 text-white border-blue-500 flex items-center gap-1"
                          >
                            <Video className="w-3 h-3" />
                            Video
                          </Button>
                        )}
                      </div>
                      
                      {/* Investment Details */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        <Badge variant="outline" className="text-xs bg-gray-100 text-gray-600 border-gray-200">
                          {formatDistanceToNow(new Date(gift.createdAt), { addSuffix: true })}
                        </Badge>
                        <Badge variant="outline" className="text-xs bg-green-100 text-green-700 border-green-200">
                          {gift.investment?.name} ({gift.investment?.symbol})
                        </Badge>
                        <Badge variant="outline" className="text-xs bg-green-100 text-green-700 border-green-200">
                          ${parseFloat(gift.amount).toFixed(2)} ({parseFloat(gift.shares).toFixed(4)} shares)
                        </Badge>
                      </div>
                      
                      {/* Personal Message */}
                      {gift.message && (
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-3">
                          <p className="text-sm italic text-gray-700">"{gift.message}"</p>
                        </div>
                      )}
                      
                      {/* Say Thanks Button */}
                      {user && !gift.thankYouSent && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSendThankYou(gift.id)}
                          className="w-full bg-white hover:bg-gray-50 text-gray-700 border-gray-300 flex items-center justify-center gap-2"
                          data-testid={`button-thank-you-${gift.id}`}
                        >
                          <Heart className="w-4 h-4" />
                          Say Thanks
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </MobileLayout>
  );
}
