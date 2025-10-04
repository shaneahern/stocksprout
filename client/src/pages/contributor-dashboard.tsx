import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { 
  Gift, 
  TrendingUp, 
  Clock, 
  DollarSign, 
  Calendar,
  ArrowLeft,
  User,
  Heart
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { Gift as GiftType, Investment, Contributor } from "@shared/schema";

type EnrichedGift = GiftType & { 
  investment: Investment;
  contributor?: Contributor | null;
  giftGiverProfileImageUrl?: string | null;
  child?: {
    id: string;
    name: string;
    giftCode: string;
  };
};

export default function ContributorDashboard() {
  const { contributor, contributorToken } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("overview");
  
  // Get the returnTo URL from query params
  const urlParams = new URLSearchParams(window.location.search);
  const returnTo = urlParams.get('returnTo') || '/';

  // Fetch all gifts made by this contributor
  const { data: allGifts = [], isLoading } = useQuery<EnrichedGift[]>({
    queryKey: ["/api/contributors/gifts", contributor?.id],
    queryFn: async () => {
      if (!contributor?.id || !contributorToken) {
        throw new Error("Contributor not authenticated");
      }
      
      const response = await fetch(`/api/contributors/${contributor.id}/gifts`, {
        headers: {
          'Authorization': `Bearer ${contributorToken}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch gifts: ${response.statusText}`);
      }
      
      return response.json();
    },
    enabled: !!contributor?.id && !!contributorToken,
  });

  if (!contributor) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="p-6 text-center">
            <User className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Not Signed In</h2>
            <p className="text-muted-foreground mb-4">
              Please sign in to view your contribution dashboard.
            </p>
            <Button onClick={() => setLocation("/")}>
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // Calculate statistics
  const totalContributed = allGifts.reduce((sum, gift) => sum + parseFloat(gift.amount), 0);
  const totalChildren = new Set(allGifts.map(gift => gift.childId)).size;
  const totalGifts = allGifts.length;

  // Group gifts by child
  const giftsByChild = allGifts.reduce((acc, gift) => {
    if (!acc[gift.childId]) {
      acc[gift.childId] = {
        child: gift.child,
        gifts: [],
        totalContributed: 0
      };
    }
    acc[gift.childId].gifts.push(gift);
    acc[gift.childId].totalContributed += parseFloat(gift.amount);
    return acc;
  }, {} as Record<string, { child: any; gifts: EnrichedGift[]; totalContributed: number }>);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-accent text-white p-4 sm:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation(returnTo)}
                className="text-white hover:bg-white/20"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </div>
            <div className="flex items-center space-x-4">
              <Avatar className="w-12 h-12">
                {contributor.profileImageUrl ? (
                  <AvatarImage src={contributor.profileImageUrl} alt={contributor.name} />
                ) : (
                  <AvatarFallback className="bg-white/20 text-white">
                    {contributor.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                )}
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold">{contributor.name}</h1>
                <p className="text-white/90">Contribution Dashboard</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6">
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Contributed</p>
                  <p className="text-2xl font-bold">${totalContributed.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Children Helped</p>
                  <p className="text-2xl font-bold">{totalChildren}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Gift className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Gifts</p>
                  <p className="text-2xl font-bold">{totalGifts}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Children You've Helped</h2>
              {Object.keys(giftsByChild).length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Heart className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">No Contributions Yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Start making a difference by sending your first investment gift!
                    </p>
                    <Button onClick={() => setLocation("/")}>
                      Find a Child to Help
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(giftsByChild).map(([childId, data]) => (
                    <Card key={childId} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <span>{data.child?.name || 'Unknown Child'}</span>
                          <Badge variant="secondary">
                            {data.gifts.length} gift{data.gifts.length !== 1 ? 's' : ''}
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Total Contributed:</span>
                            <span className="font-semibold">${data.totalContributed.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Last Gift:</span>
                            <span className="text-sm">
                              {formatDistanceToNow(new Date(data.gifts[0]?.createdAt || Date.now()), { addSuffix: true })}
                            </span>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full"
                            onClick={() => setLocation(`/gift/${data.child?.giftCode}`)}
                          >
                            Send Another Gift
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="timeline" className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Your Contribution Timeline</h2>
              {allGifts.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Clock className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">No Contributions Yet</h3>
                    <p className="text-muted-foreground">
                      Your contribution timeline will appear here once you start sending gifts.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {allGifts
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .map((gift) => (
                    <Card key={gift.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-3">
                          <Avatar className="w-10 h-10">
                            {contributor.profileImageUrl ? (
                              <AvatarImage src={contributor.profileImageUrl} alt={contributor.name} />
                            ) : (
                              <AvatarFallback className="bg-green-500 text-white">
                                {contributor.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-2">
                              <h3 className="font-bold text-base">
                                Gift to {gift.child?.name || 'Unknown Child'}
                              </h3>
                              <Badge variant="outline" className="text-xs w-fit">
                                {formatDistanceToNow(new Date(gift.createdAt), { addSuffix: true })}
                              </Badge>
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center space-x-2">
                                <TrendingUp className="w-4 h-4 text-green-600" />
                                <span className="font-semibold">${parseFloat(gift.amount).toFixed(2)}</span>
                                <span className="text-muted-foreground">•</span>
                                <span className="text-sm text-muted-foreground">
                                  {gift.investment.symbol} - {gift.investment.name}
                                </span>
                              </div>
                              {gift.message && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  "{gift.message}"
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
