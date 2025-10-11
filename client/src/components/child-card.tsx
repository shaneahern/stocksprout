import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Share2, Gift, Camera, Clock, AlertCircle, Users, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { generateSMSMessage, shareViaWebShare } from "@/lib/sms-utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";

interface ChildCardProps {
  child: any;
  isContributedChild?: boolean; // True if this is a child the contributor has helped (not their own)
}

export default function ChildCard({ child, isContributedChild = false }: ChildCardProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user, token } = useAuth();

  // Camera states
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

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

  // Update child profile photo mutation
  const updatePhotoMutation = useMutation({
    mutationFn: async (profileImageUrl: string) => {
      const response = await fetch(`/api/children/${child.id}/profile-photo`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ profileImageUrl }),
      });
      if (!response.ok) throw new Error("Failed to update photo");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/children"] });
      toast({
        title: "Photo Updated!",
        description: `Profile photo for ${child.name} has been updated.`,
      });
      setIsCameraOpen(false);
      setCapturedImage(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update profile photo.",
        variant: "destructive",
      });
    },
  });

  // Camera methods
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      toast({
        title: "Camera Error",
        description: "Could not access camera. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        setCapturedImage(imageData);
        stopCamera();
      }
    }
  };

  const savePhoto = () => {
    if (capturedImage) {
      updatePhotoMutation.mutate(capturedImage);
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    startCamera();
  };

  // Start camera when dialog opens
  useEffect(() => {
    if (isCameraOpen && !capturedImage) {
      startCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isCameraOpen]);

  const handleViewPortfolio = () => {
    setLocation(`/portfolio/${child.id}`);
  };

  const handleShareGiftLink = () => {
    generateLinkMutation.mutate();
  };

  const handleSendGift = () => {
    setLocation(`/gift/${child.giftLinkCode || child.giftCode}`);
  };

  // Fetch real portfolio data
  const { data: allPortfolioData = [] } = useQuery<any[]>({
    queryKey: ["/api/portfolio", child.id],
  });

  const { data: allGifts = [] } = useQuery<any[]>({
    queryKey: ["/api/gifts", child.id],
  });

  // Filter data based on whether this is a contributed child
  const portfolioData = isContributedChild 
    ? allPortfolioData
        .filter((holding: any) => {
          // Only show holdings from user's gifts
          return allGifts.some((gift: any) => 
            gift.contributorId === user?.id && gift.investmentId === holding.investmentId
          );
        })
        .map((holding: any) => {
          // Recalculate shares and values based on only user's gifts
          const userGiftsForInvestment = allGifts.filter((gift: any) => 
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
          const currentPrice = parseFloat(holding.investment?.currentPrice || holding.currentPrice || "0");
          const currentValue = totalUserShares * currentPrice;
          
          return {
            ...holding,
            shares: totalUserShares.toFixed(6),
            averageCost: avgCost.toFixed(2),
            currentValue: currentValue.toFixed(2),
          };
        })
    : allPortfolioData;

  const gifts = isContributedChild
    ? allGifts.filter((g: any) => g.contributorId === user?.id)
    : allGifts;

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
    <>
      <Card 
        onClick={handleViewPortfolio}
        className="border border-border shadow-sm cursor-pointer hover:shadow-md transition-shadow" 
        data-testid={`card-child-${child.id}`}
      >
        <CardContent className="p-5">
          <div className="flex items-center space-x-4 mb-4">
            <div className="relative">
              <Avatar className="w-16 h-16 border-2 border-primary/20">
                {child.profileImageUrl && (
                  <AvatarImage src={child.profileImageUrl} alt={child.name} />
                )}
                <AvatarFallback className="text-lg font-bold">
                  {child.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              {!isContributedChild && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsCameraOpen(true);
                  }}
                  className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground rounded-full p-1.5 shadow-md hover:bg-primary/90 transition-colors"
                  aria-label="Add profile photo"
                >
                  <Camera className="w-3 h-3" />
                </button>
              )}
            </div>
          <div className="flex-1">
            <h3 className="font-bold text-lg text-foreground">{child.name}</h3>
            <p className="text-muted-foreground text-sm">Age {child.age}</p>
          </div>
          <div className="text-right">
            <div className="flex items-center justify-end gap-2">
              <p className="text-2xl font-bold text-foreground" data-testid={`text-child-value-${child.id}`}>
                ${(isContributedChild ? child.totalValue : portfolioStats.totalValue).toLocaleString()}
              </p>
              {isContributedChild && child.pendingCount > 0 && (
                <span title={`${child.pendingCount} gift(s) pending approval`}>
                  <Clock className="w-5 h-5 text-amber-500" />
                </span>
              )}
            </div>
            <div className="flex items-center justify-end mt-1">
              <span className="text-sm font-medium" style={{ color: '#328956' }}>
                +{portfolioStats.monthlyGrowth}% growth
              </span>
            </div>
            {isContributedChild && child.pendingCount > 0 && (
              <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200 mt-2">
                <Clock className="w-3 h-3 mr-1" />
                {child.pendingCount} Pending Approval
              </Badge>
            )}
          </div>
        </div>
        
        
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <Button 
            onClick={(e) => {
              e.stopPropagation();
              handleSendGift();
            }}
            className="flex-1 text-white font-semibold text-sm sm:text-base hover:opacity-90 py-1"
            style={{ backgroundColor: '#328956' }}
            data-testid={`button-send-gift-${child.id}`}
          >
            <Gift className="w-4 h-4 mr-2" />
            <span>Send Gift</span>
          </Button>
          {!isContributedChild && (
            <Button 
              onClick={(e) => {
                e.stopPropagation();
                handleShareGiftLink();
              }}
              disabled={generateLinkMutation.isPending}
              className="flex-1 text-white font-semibold text-sm sm:text-base hover:opacity-90 py-1"
              style={{ backgroundColor: '#8A3324' }}
              data-testid={`button-sprout-request-${child.id}`}
            >
              <UserPlus className="w-4 h-4 mr-2" />
              <span>{generateLinkMutation.isPending ? "Requesting..." : "Sprout Request"}</span>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>

      {/* Camera Dialog */}
      <Dialog open={isCameraOpen} onOpenChange={(open) => {
        setIsCameraOpen(open);
        if (!open) {
          stopCamera();
          setCapturedImage(null);
        }
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Profile Photo for {child.name}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {!capturedImage ? (
              <>
                <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={capturePhoto}
                    className="flex-1"
                  >
                    Capture Photo
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsCameraOpen(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                  <img
                    src={capturedImage}
                    alt="Captured"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={savePhoto}
                    disabled={updatePhotoMutation.isPending}
                    className="flex-1"
                  >
                    {updatePhotoMutation.isPending ? "Saving..." : "Use This Photo"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={retakePhoto}
                    className="flex-1"
                  >
                    Retake
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
