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
  Heart,
  LogOut,
  CheckCircle,
  AlertCircle
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
  const { user, token, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("overview");
  
  // Get the returnTo URL from query params
  const urlParams = new URLSearchParams(window.location.search);
  const returnTo = urlParams.get('returnTo') || '/';

  // Fetch all gifts made by this user
  const { data: allGifts = [], isLoading } = useQuery<EnrichedGift[]>({
    queryKey: ["/api/contributors/gifts", user?.id],
    queryFn: async () => {
      if (!user?.id || !token) {
        throw new Error("User not authenticated");
      }
      
      const response = await fetch(`/api/contributors/${user.id}/gifts`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch gifts: ${response.statusText}`);
      }
      
      return response.json();
    },
    enabled: !!user?.id && !!token,
  });

  if (!user) {
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

  // Calculate statistics (excluding rejected gifts)
  const activeGifts = allGifts.filter(gift => gift.status !== 'rejected');
  const totalContributed = activeGifts.reduce((sum, gift) => sum + parseFloat(gift.amount), 0);
  const totalChildren = new Set(activeGifts.map(gift => gift.childId)).size;
  const totalGifts = activeGifts.length;
  const pendingGifts = allGifts.filter(gift => gift.status === 'pending').length;
  const approvedGifts = allGifts.filter(gift => gift.status === 'approved').length;

  // Group gifts by child (excluding rejected gifts from totals)
  const giftsByChild = allGifts.reduce((acc, gift) => {
    if (!acc[gift.childId]) {
      acc[gift.childId] = {
        child: gift.child,
        gifts: [],
        totalContributed: 0,
        pendingCount: 0
      };
    }
    acc[gift.childId].gifts.push(gift);
    // Only add to total if not rejected
    if (gift.status !== 'rejected') {
      acc[gift.childId].totalContributed += parseFloat(gift.amount);
    }
    if (gift.status === 'pending') {
      acc[gift.childId].pendingCount++;
    }
    return acc;
  }, {} as Record<string, { child: any; gifts: EnrichedGift[]; totalContributed: number; pendingCount: number }>);

  const handleSignOut = () => {
    logout();
    setLocation('/');
  };

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
                {user.profileImageUrl ? (
                  <AvatarImage src={user.profileImageUrl} alt={user.name} />
                ) : (
                  <AvatarFallback className="bg-white/20 text-white">
                    {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                )}
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold">{user.name}</h1>
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
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">${data.totalContributed.toFixed(2)}</span>
                              {data.pendingCount > 0 && (
                                <span title={`${data.pendingCount} gift(s) pending approval`}>
                                  <Clock className="w-4 h-4 text-amber-500" />
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Last Gift:</span>
                            <span className="text-sm">
                              {formatDistanceToNow(new Date(data.gifts[0]?.createdAt || Date.now()), { addSuffix: true })}
                            </span>
                          </div>
                          {data.pendingCount > 0 && (
                            <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 p-2 rounded">
                              <AlertCircle className="w-3 h-3" />
                              <span>{data.pendingCount} gift{data.pendingCount !== 1 ? 's' : ''} pending custodian approval</span>
                            </div>
                          )}
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
                            {user.profileImageUrl ? (
                              <AvatarImage src={user.profileImageUrl} alt={user.name} />
                            ) : (
                              <AvatarFallback className="bg-green-500 text-white">
                                {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-2">
                              <h3 className="font-bold text-base">
                                Gift to {gift.child?.name || 'Unknown Child'}
                              </h3>
                              <div className="flex items-center gap-2">
                                {gift.status === 'pending' && (
                                  <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200">
                                    <Clock className="w-3 h-3 mr-1" />
                                    Pending Approval
                                  </Badge>
                                )}
                                {gift.status === 'approved' && (
                                  <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Approved
                                  </Badge>
                                )}
                                {gift.status === 'rejected' && (
                                  <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200">
                                    <AlertCircle className="w-3 h-3 mr-1" />
                                    Rejected
                                  </Badge>
                                )}
                                <Badge variant="outline" className="text-xs w-fit">
                                  {formatDistanceToNow(new Date(gift.createdAt), { addSuffix: true })}
                                </Badge>
                              </div>
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

        {/* Sign Out Button */}
        <div className="mt-8 mb-8 flex justify-center">
          <Button 
            variant="outline" 
            onClick={handleSignOut}
            className="w-full max-w-md"
          >
            <LogOut className="w-5 h-5 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
}
