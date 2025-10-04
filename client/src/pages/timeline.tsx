import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import MobileLayout from "@/components/mobile-layout";
import { VideoPlayerModal } from "@/components/video-player-modal";
import { ChildSelector } from "@/components/child-selector";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Gift, PlayCircle, Heart, Sprout, Leaf, AlertCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Gift as GiftType, Investment } from "@shared/schema";

type EnrichedGift = GiftType & { investment: Investment };

export default function Timeline() {
  const [, params] = useRoute("/timeline/:childId");
  const childId = params?.childId;
  const { toast } = useToast();
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [currentVideo, setCurrentVideo] = useState<{ url: string; giverName: string } | null>(null);

  const { data: allGifts = [], isLoading } = useQuery<EnrichedGift[]>({
    queryKey: ["/api/gifts", childId],
    enabled: !!childId,
  });

  // Filter to show only approved gifts in timeline
  const gifts = allGifts.filter((gift: any) => gift.status === 'approved');
  const pendingGifts = allGifts.filter((gift: any) => gift.status === 'pending');

  if (isLoading) {
    return (
      <MobileLayout currentTab="timeline">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
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
      
      <div className="space-y-6">
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

        {/* Pending Gifts Alert */}
        {pendingGifts.length > 0 && (
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
                <Card key={gift.id} className="relative" data-testid={`card-gift-${gift.id}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <Gift className="w-5 h-5 text-white" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-2">
                          <h3 className="font-bold text-base">
                            From {gift.giftGiverName}
                          </h3>
                          <Badge variant="outline" className="text-xs w-fit">
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
                          {gift.videoMessageUrl && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => gift.videoMessageUrl && handlePlayVideo(gift.videoMessageUrl, gift.giftGiverName)}
                              data-testid={`button-play-video-${gift.id}`}
                              className="text-xs"
                            >
                              <PlayCircle className="w-4 h-4 mr-2" />
                              Play Video
                            </Button>
                          )}
                          
                          {!gift.thankYouSent && (
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
