import { ReactNode, useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { PendingGiftsModal } from "@/components/pending-gifts-modal";
import { Home, TrendingUp, History, User, Bell, X, Gift, AlertCircle, Gamepad2, Heart } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { queryClient } from "@/lib/queryClient";
// Logo is now served as a static asset

interface MobileLayoutProps {
  children: ReactNode;
  currentTab: "home" | "portfolio" | "timeline" | "profile" | "activities";
}

export default function MobileLayout({ children, currentTab }: MobileLayoutProps) {
  const [location, setLocation] = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showPendingGifts, setShowPendingGifts] = useState(false);
  const [currentQuote, setCurrentQuote] = useState("");
  const { user, token } = useAuth();


  // Pool of motivational quotes
  const quotes = [
    "Start before they know what money is, and with more than they imagined...",
    "Diapers may change, but wealth can...",
    "While they learn to walk, their money learns to run...",
    "Crayons in one hand, a portfolio in the other...",
    "Start small, grow tall. Investing young builds powerful kids' futures...",
    "Plant seeds today, harvest wealth tomorrow...",
    "From piggy banks to portfolios...",
    "Building tomorrow's millionaires, one investment at a time...",
    "Childhood dreams, adult wealth...",
    "The best time to invest was yesterday, the second best is now..."
  ];

  // Pick a random quote when the tab changes
  useEffect(() => {
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    setCurrentQuote(randomQuote);
  }, [currentTab]);

  // Fetch custodian's children (children where user is parent)
  const { data: childrenData = [] } = useQuery<any[]>({
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
      const isOwnChild = childrenData.some((child: any) => child.id === gift.child.id);
      if (!isOwnChild) {
        acc.push(gift.child);
      }
    }
    return acc;
  }, []);

  const handlePortfolioClick = () => {
    // First check if user has their own children (as custodian)
    if (childrenData.length > 0) {
      setLocation(`/portfolio/${childrenData[0].id}`);
    } 
    // Otherwise check for children they've contributed to
    else if (contributedChildren.length > 0) {
      setLocation(`/portfolio/${contributedChildren[0].id}`);
    } else {
      setLocation("/portfolio"); // Let the page handle empty state
    }
  };

  const handleTimelineClick = () => {
    // First check if user has their own children (as custodian)
    if (childrenData.length > 0) {
      setLocation(`/timeline/${childrenData[0].id}`);
    } 
    // Otherwise check for children they've contributed to
    else if (contributedChildren.length > 0) {
      setLocation(`/timeline/${contributedChildren[0].id}`);
    } else {
      setLocation("/timeline"); // Let the page handle empty state
    }
  };

  // Fetch all gifts for notifications
  const { data: allGifts = [] } = useQuery<any[]>({
    queryKey: ["/api/all-notifications"],
    queryFn: async () => {
      if (childrenData.length === 0) return [];
      const giftPromises = childrenData.map((child: any) => 
        fetch(`/api/gifts/${child.id}`).then(res => res.json())
      );
      const giftArrays = await Promise.all(giftPromises);
      return giftArrays.flat().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    },
    enabled: childrenData.length > 0,
  });

  // Fetch thank you notifications from the new notifications API
  const { data: thankYouNotifications = [] } = useQuery<any[]>({
    queryKey: ["/api/notifications"],
    queryFn: async () => {
      if (!user?.id || !token) return [];
      const response = await fetch('/api/notifications', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) return [];
      return response.json();
    },
    enabled: !!user?.id && !!token,
  });

  // Only count approved gifts as unread, and pending gifts separately
  const pendingCount = allGifts.filter((gift: any) => !gift.status || gift.status === 'pending').length;
  const unreadApprovedCount = allGifts.filter((gift: any) => !gift.isViewed && gift.status === 'approved').length;
  const unreadThankYouCount = thankYouNotifications.filter((notif: any) => !notif.isRead).length;
  const totalUnreadCount = unreadApprovedCount + unreadThankYouCount;

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
  };

  return (
    <div className="mobile-container min-h-screen flex flex-col">
      {/* App Header - Only show on home */}
      {currentTab === "home" && (
        <div className="bg-white px-4 pt-2 pb-1 sm:pt-2 sm:pb-1 md:pt-2 md:pb-1 border-b border-border flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <img
                  src="/stocksprout-logo.png"
                  alt="StockSprout logo"
                  className="block w-full h-auto max-h-16 sm:max-h-16 md:max-h-12 lg:max-h-10 max-w-32 sm:max-w-32 md:max-w-28 lg:max-w-24 object-contain flex-shrink-0"
                  data-testid="img-logo"
                />
              </div>
              <div className="flex flex-col justify-center pr-2">
                <p className="text-xs leading-tight text-muted-foreground" data-testid="text-tagline">
                  Start before they know what money is, end with more then they imagined...
                </p>
              </div>
            </div>
            <div className="relative">
              <button 
                onClick={handleNotificationClick}
                className="w-10 h-10 rounded-full flex items-center justify-center transition-colors"
                style={{ backgroundColor: '#009538' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#007a2e'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#009538'}
                data-testid="button-notifications"
              >
                <Bell className="w-5 h-5 text-white" />
              </button>
              {(totalUnreadCount > 0 || pendingCount > 0) && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">{pendingCount > 0 ? pendingCount : totalUnreadCount}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Pending Gifts Modal */}
      <PendingGiftsModal
        isOpen={showPendingGifts}
        onClose={() => setShowPendingGifts(false)}
      />

      {/* Notifications Dropdown */}
      {showNotifications && (
        <div className="absolute top-16 right-4 w-80 bg-white border border-border rounded-lg shadow-lg z-50">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h3 className="font-bold text-lg">Notifications</h3>
            <button 
              onClick={() => setShowNotifications(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {pendingCount > 0 && (
            <div className="p-3 border-b border-border bg-orange-50">
              <button
                onClick={() => {
                  setShowNotifications(false);
                  setShowPendingGifts(true);
                }}
                className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-orange-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-sm">
                      {pendingCount} Gift{pendingCount > 1 ? 's' : ''} Awaiting Review
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Tap to approve or reject
                    </p>
                  </div>
                </div>
                <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">{pendingCount}</span>
                </div>
              </button>
            </div>
          )}
          <div className="max-h-64 overflow-y-auto">
            {/* Thank You Notifications */}
            {thankYouNotifications
              .filter((notif: any) => !notif.isRead)
              .map((notification: any) => {
                const child = childrenData.find((c: any) => c.id === notification.relatedChildId);
                return (
                  <button
                    key={notification.id}
                    onClick={async () => {
                      // Mark as read
                      try {
                        await fetch(`/api/notifications/${notification.id}/read`, {
                          method: 'PATCH',
                          headers: {
                            'Authorization': `Bearer ${token}`,
                          },
                        });
                        queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
                      } catch (error) {
                        console.error('Failed to mark notification as read:', error);
                      }
                      // Navigate to timeline
                      setShowNotifications(false);
                      if (notification.relatedChildId) {
                        setLocation(`/timeline/${notification.relatedChildId}`);
                      }
                    }}
                    className="w-full p-3 border-b border-border hover:bg-muted text-left transition-colors"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <Heart className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold">{notification.title}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                      {!notification.isRead && (
                        <div className="w-2 h-2 bg-primary rounded-full mt-1 flex-shrink-0"></div>
                      )}
                    </div>
                  </button>
                );
              })
            }

            {/* Gift Notifications */}
            {allGifts
              .filter((gift: any) => {
                // Show pending gifts or unread approved gifts
                const isPending = !gift.status || gift.status === 'pending';
                const isUnreadApproved = gift.status === 'approved' && !gift.isViewed;
                return isPending || isUnreadApproved;
              })
              .slice(0, 5)
              .map((gift: any) => {
                const child = childrenData.find((c: any) => c.id === gift.childId);
                // Check if pending - default to pending if status is undefined (new gifts)
                const isPending = !gift.status || gift.status === 'pending';
                return (
                  <button
                    key={gift.id}
                    onClick={() => {
                      if (isPending) {
                        setShowNotifications(false);
                        setShowPendingGifts(true);
                      } else {
                        setShowNotifications(false);
                        setLocation(`/timeline/${gift.childId}`);
                      }
                    }}
                    className="w-full p-3 border-b border-border hover:bg-muted text-left transition-colors"
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`w-8 h-8 ${isPending ? 'bg-orange-500' : 'bg-gradient-to-br from-secondary to-accent'} rounded-full flex items-center justify-center flex-shrink-0`}>
                        {isPending ? (
                          <AlertCircle className="w-4 h-4 text-white" />
                        ) : (
                          <Gift className="w-4 h-4 text-white" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold">
                          {isPending ? '⚠️ ' : ''}
                          {isPending ? 'Pending Review: ' : ''}Gift for {child?.name} from {gift.giftGiverName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          ${parseFloat(gift.amount).toFixed(2)} • {formatDistanceToNow(new Date(gift.createdAt), { addSuffix: true })}
                        </p>
                        {isPending && (
                          <p className="text-xs text-orange-600 font-semibold mt-1">
                            Tap to approve or reject
                          </p>
                        )}
                        {!gift.isViewed && !isPending && (
                          <div className="w-2 h-2 bg-primary rounded-full mt-1"></div>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            }

            {/* Empty State */}
            {allGifts.filter((g: any) => (!g.status || g.status === 'pending') || (g.status === 'approved' && !g.isViewed)).length === 0 && 
             thankYouNotifications.filter((n: any) => !n.isRead).length === 0 && (
              <div className="p-4 text-center text-muted-foreground">
                <p>No notifications yet</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className={`flex-1 overflow-y-auto px-4 sm:px-6 pb-36 ${currentTab === "home" ? "pt-1 sm:pt-1" : "pt-10 sm:pt-12 pb-4 sm:pb-6"}`}>
        {children}
      </div>

      {/* Tab Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#F9F9F9] border-t border-[#DEDEDE] shadow-lg z-40">
        <div className="flex">
          <Link href="/" className="flex-1">
            <button 
              className={`w-full py-4 text-center ${
                currentTab === "home" ? "text-black" : "text-black"
              }`}
              data-testid="tab-home"
            >
              <Home className="w-6 h-6 mx-auto mb-1" />
              <span className="text-xs font-normal">Home</span>
            </button>
          </Link>
          
          <button 
            onClick={handlePortfolioClick}
            className={`flex-1 py-4 text-center ${
              currentTab === "portfolio" ? "text-black" : "text-black"
            }`}
            data-testid="tab-portfolio"
          >
            <TrendingUp className="w-6 h-6 mx-auto mb-1" />
            <span className="text-xs font-normal">Portfolio</span>
          </button>
          
          <button 
            onClick={handleTimelineClick}
            className={`flex-1 py-4 text-center ${
              currentTab === "timeline" ? "text-black" : "text-black"
            }`}
            data-testid="tab-timeline"
          >
            <History className="w-6 h-6 mx-auto mb-1" />
            <span className="text-xs font-normal">Timeline</span>
          </button>
          
          <Link href="/activities" className="flex-1">
            <button 
              className={`w-full py-4 text-center transition-colors ${
                currentTab === "activities" 
                  ? "text-black bg-[#F1FFF7]" 
                  : "text-black"
              }`}
              data-testid="tab-activities"
            >
              <Gamepad2 className="w-6 h-6 mx-auto mb-1" />
              <span className="text-xs font-normal">Activities</span>
            </button>
          </Link>
          
          <Link href="/profile" className="flex-1">
            <button 
              className={`w-full py-4 text-center ${
                currentTab === "profile" ? "text-black" : "text-black"
              }`}
              data-testid="tab-profile"
            >
              <User className="w-6 h-6 mx-auto mb-1" />
              <span className="text-xs font-normal">Profile</span>
            </button>
          </Link>
        </div>
        {/* Home indicator */}
        <div className="w-32 h-1 bg-black rounded-full mx-auto mb-1"></div>
      </div>
    </div>
  );
}
