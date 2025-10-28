import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { PendingGiftsModal } from "@/components/pending-gifts-modal";
import { Home, TrendingUp, History, User, Bell, X, Gift, AlertCircle, Gamepad2, Heart } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { queryClient } from "@/lib/queryClient";
export default function MobileLayout({ children, currentTab }) {
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
    const { data: childrenData = [] } = useQuery({
        queryKey: ["/api/children", user?.id],
        enabled: !!user?.id,
    });
    // Fetch children that user has contributed to (gifts they've given)
    const { data: contributorGifts = [] } = useQuery({
        queryKey: ["/api/contributors/gifts", user?.id],
        queryFn: async () => {
            if (!user?.id || !token)
                return [];
            const response = await fetch(`/api/contributors/${user.id}/gifts`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            if (!response.ok)
                return [];
            return response.json();
        },
        enabled: !!user?.id && !!token,
    });
    // Extract unique children from contributor gifts (excluding own children)
    const contributedChildren = contributorGifts.reduce((acc, gift) => {
        if (gift.child && !acc.find((c) => c.id === gift.child.id)) {
            // Only include if this is not one of the user's own children
            const isOwnChild = childrenData.some((child) => child.id === gift.child.id);
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
        }
        else {
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
        }
        else {
            setLocation("/timeline"); // Let the page handle empty state
        }
    };
    // Fetch all gifts for notifications
    const { data: allGifts = [] } = useQuery({
        queryKey: ["/api/all-notifications"],
        queryFn: async () => {
            if (childrenData.length === 0)
                return [];
            const giftPromises = childrenData.map((child) => fetch(`/api/gifts/${child.id}`).then(res => res.json()));
            const giftArrays = await Promise.all(giftPromises);
            return giftArrays.flat().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        },
        enabled: childrenData.length > 0,
    });
    // Fetch thank you notifications from the new notifications API
    const { data: thankYouNotifications = [] } = useQuery({
        queryKey: ["/api/notifications"],
        queryFn: async () => {
            if (!user?.id || !token)
                return [];
            const response = await fetch('/api/notifications', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            if (!response.ok)
                return [];
            return response.json();
        },
        enabled: !!user?.id && !!token,
    });
    // Only count approved gifts as unread, and pending gifts separately
    const pendingCount = allGifts.filter((gift) => !gift.status || gift.status === 'pending').length;
    const unreadApprovedCount = allGifts.filter((gift) => !gift.isViewed && gift.status === 'approved').length;
    const unreadThankYouCount = thankYouNotifications.filter((notif) => !notif.isRead).length;
    const totalUnreadCount = unreadApprovedCount + unreadThankYouCount;
    const handleNotificationClick = () => {
        setShowNotifications(!showNotifications);
    };
    return (_jsxs("div", { className: "mobile-container min-h-screen flex flex-col", children: [currentTab === "home" && (_jsx("div", { className: "bg-white px-4 pt-2 pb-1 sm:pt-2 sm:pb-1 md:pt-2 md:pb-1 border-b border-border flex-shrink-0", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center space-x-4", children: [_jsx("div", { className: "flex items-center", children: _jsx("img", { src: "/stocksprout-logo.png", alt: "StockSprout logo", className: "block w-full h-auto max-h-16 sm:max-h-16 md:max-h-12 lg:max-h-10 max-w-32 sm:max-w-32 md:max-w-28 lg:max-w-24 object-contain flex-shrink-0", "data-testid": "img-logo" }) }), _jsx("div", { className: "flex flex-col justify-center pr-2", children: _jsx("p", { className: "text-xs leading-tight text-muted-foreground", "data-testid": "text-tagline", children: "Start before they know what money is, end with more then they imagined..." }) })] }), _jsxs("div", { className: "relative", children: [_jsx("button", { onClick: handleNotificationClick, className: "w-10 h-10 rounded-full flex items-center justify-center transition-colors", style: { backgroundColor: '#009538' }, onMouseEnter: (e) => e.currentTarget.style.backgroundColor = '#007a2e', onMouseLeave: (e) => e.currentTarget.style.backgroundColor = '#009538', "data-testid": "button-notifications", children: _jsx(Bell, { className: "w-5 h-5 text-white" }) }), (totalUnreadCount > 0 || pendingCount > 0) && (_jsx("div", { className: "absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center", children: _jsx("span", { className: "text-white text-xs font-bold", children: pendingCount > 0 ? pendingCount : totalUnreadCount }) }))] })] }) })), _jsx(PendingGiftsModal, { isOpen: showPendingGifts, onClose: () => setShowPendingGifts(false) }), showNotifications && (_jsxs("div", { className: "absolute top-16 right-4 w-80 bg-white border border-border rounded-lg shadow-lg z-50", children: [_jsxs("div", { className: "p-4 border-b border-border flex items-center justify-between", children: [_jsx("h3", { className: "font-bold text-lg", children: "Notifications" }), _jsx("button", { onClick: () => setShowNotifications(false), className: "text-muted-foreground hover:text-foreground", children: _jsx(X, { className: "w-5 h-5" }) })] }), pendingCount > 0 && (_jsx("div", { className: "p-3 border-b border-border bg-orange-50", children: _jsxs("button", { onClick: () => {
                                setShowNotifications(false);
                                setShowPendingGifts(true);
                            }, className: "w-full flex items-center justify-between p-3 rounded-lg hover:bg-orange-100 transition-colors", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center", children: _jsx(AlertCircle, { className: "w-5 h-5 text-white" }) }), _jsxs("div", { className: "text-left", children: [_jsxs("p", { className: "font-semibold text-sm", children: [pendingCount, " Gift", pendingCount > 1 ? 's' : '', " Awaiting Review"] }), _jsx("p", { className: "text-xs text-muted-foreground", children: "Tap to approve or reject" })] })] }), _jsx("div", { className: "w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center", children: _jsx("span", { className: "text-white text-xs font-bold", children: pendingCount }) })] }) })), _jsxs("div", { className: "max-h-64 overflow-y-auto", children: [thankYouNotifications
                                .filter((notif) => !notif.isRead)
                                .map((notification) => {
                                const child = childrenData.find((c) => c.id === notification.relatedChildId);
                                return (_jsx("button", { onClick: async () => {
                                        // Mark as read
                                        try {
                                            await fetch(`/api/notifications/${notification.id}/read`, {
                                                method: 'PATCH',
                                                headers: {
                                                    'Authorization': `Bearer ${token}`,
                                                },
                                            });
                                            queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
                                        }
                                        catch (error) {
                                            console.error('Failed to mark notification as read:', error);
                                        }
                                        // Navigate to timeline
                                        setShowNotifications(false);
                                        if (notification.relatedChildId) {
                                            setLocation(`/timeline/${notification.relatedChildId}`);
                                        }
                                    }, className: "w-full p-3 border-b border-border hover:bg-muted text-left transition-colors", children: _jsxs("div", { className: "flex items-start space-x-3", children: [_jsx("div", { className: "w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0", children: _jsx(Heart, { className: "w-4 h-4 text-white" }) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("p", { className: "text-sm font-semibold", children: notification.title }), _jsx("p", { className: "text-xs text-muted-foreground line-clamp-2", children: notification.message }), _jsx("p", { className: "text-xs text-muted-foreground mt-1", children: formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true }) })] }), !notification.isRead && (_jsx("div", { className: "w-2 h-2 bg-primary rounded-full mt-1 flex-shrink-0" }))] }) }, notification.id));
                            }), allGifts
                                .filter((gift) => {
                                // Show pending gifts or unread approved gifts
                                const isPending = !gift.status || gift.status === 'pending';
                                const isUnreadApproved = gift.status === 'approved' && !gift.isViewed;
                                return isPending || isUnreadApproved;
                            })
                                .slice(0, 5)
                                .map((gift) => {
                                const child = childrenData.find((c) => c.id === gift.childId);
                                // Check if pending - default to pending if status is undefined (new gifts)
                                const isPending = !gift.status || gift.status === 'pending';
                                return (_jsx("button", { onClick: () => {
                                        if (isPending) {
                                            setShowNotifications(false);
                                            setShowPendingGifts(true);
                                        }
                                        else {
                                            setShowNotifications(false);
                                            setLocation(`/timeline/${gift.childId}`);
                                        }
                                    }, className: "w-full p-3 border-b border-border hover:bg-muted text-left transition-colors", children: _jsxs("div", { className: "flex items-start space-x-3", children: [_jsx("div", { className: `w-8 h-8 ${isPending ? 'bg-orange-500' : 'bg-gradient-to-br from-secondary to-accent'} rounded-full flex items-center justify-center flex-shrink-0`, children: isPending ? (_jsx(AlertCircle, { className: "w-4 h-4 text-white" })) : (_jsx(Gift, { className: "w-4 h-4 text-white" })) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsxs("p", { className: "text-sm font-semibold", children: [isPending ? '⚠️ ' : '', isPending ? 'Pending Review: ' : '', "Gift for ", child?.name, " from ", gift.giftGiverName] }), _jsxs("p", { className: "text-xs text-muted-foreground", children: ["$", parseFloat(gift.amount).toFixed(2), " \u2022 ", formatDistanceToNow(new Date(gift.createdAt), { addSuffix: true })] }), isPending && (_jsx("p", { className: "text-xs text-orange-600 font-semibold mt-1", children: "Tap to approve or reject" })), !gift.isViewed && !isPending && (_jsx("div", { className: "w-2 h-2 bg-primary rounded-full mt-1" }))] })] }) }, gift.id));
                            }), allGifts.filter((g) => (!g.status || g.status === 'pending') || (g.status === 'approved' && !g.isViewed)).length === 0 &&
                                thankYouNotifications.filter((n) => !n.isRead).length === 0 && (_jsx("div", { className: "p-4 text-center text-muted-foreground", children: _jsx("p", { children: "No notifications yet" }) }))] })] })), _jsx("div", { className: `flex-1 overflow-y-auto px-4 sm:px-6 pb-36 ${currentTab === "home" ? "pt-1 sm:pt-1" : "pt-10 sm:pt-12 pb-4 sm:pb-6"}`, children: children }), _jsxs("div", { className: "fixed bottom-0 left-0 right-0 h-[92px] flex flex-col justify-between bg-[#F9F9F9] border-t border-[#DEDEDE] shadow-lg z-40", children: [_jsxs("div", { className: "flex flex-1", children: [_jsx(Link, { href: "/", className: "flex-1", children: _jsxs("button", { className: `w-full h-full flex flex-col items-center justify-center ${currentTab === "home" ? "text-black" : "text-black"}`, "data-testid": "tab-home", children: [_jsx(Home, { className: "w-8 h-8 mb-1" }), _jsx("span", { className: "text-xs font-normal", children: "Home" })] }) }), _jsxs("button", { onClick: handlePortfolioClick, className: `flex-1 h-full flex flex-col items-center justify-center ${currentTab === "portfolio" ? "text-black" : "text-black"}`, "data-testid": "tab-portfolio", children: [_jsx(TrendingUp, { className: "w-8 h-8 mb-1" }), _jsx("span", { className: "text-xs font-normal", children: "Portfolio" })] }), _jsxs("button", { onClick: handleTimelineClick, className: `flex-1 h-full flex flex-col items-center justify-center ${currentTab === "timeline" ? "text-black" : "text-black"}`, "data-testid": "tab-timeline", children: [_jsx(History, { className: "w-8 h-8 mb-1" }), _jsx("span", { className: "text-xs font-normal", children: "Timeline" })] }), _jsx(Link, { href: "/activities", className: "flex-1", children: _jsxs("button", { className: `w-full h-full flex flex-col items-center justify-center transition-colors ${currentTab === "activities"
                                        ? "text-black bg-[#F1FFF7]"
                                        : "text-black"}`, "data-testid": "tab-activities", children: [_jsx(Gamepad2, { className: "w-8 h-8 mb-1" }), _jsx("span", { className: "text-xs font-normal", children: "Activities" })] }) }), _jsx(Link, { href: "/profile", className: "flex-1", children: _jsxs("button", { className: `w-full h-full flex flex-col items-center justify-center ${currentTab === "profile" ? "text-black" : "text-black"}`, "data-testid": "tab-profile", children: [_jsx(User, { className: "w-8 h-8 mb-1" }), _jsx("span", { className: "text-xs font-normal", children: "Profile" })] }) })] }), _jsx("div", { className: "w-32 h-[5px] bg-black rounded-full mx-auto mb-[6px]" })] })] }));
}
