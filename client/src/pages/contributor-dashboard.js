import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { Gift, TrendingUp, Clock, DollarSign, ArrowLeft, User, Heart, LogOut, CheckCircle, AlertCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
export default function ContributorDashboard() {
    const { user, token, logout } = useAuth();
    const [, setLocation] = useLocation();
    const [activeTab, setActiveTab] = useState("overview");
    // Get the returnTo URL from query params
    const urlParams = new URLSearchParams(window.location.search);
    const returnTo = urlParams.get('returnTo') || '/';
    // Fetch all gifts made by this user
    const { data: allGifts = [], isLoading } = useQuery({
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
        return (_jsx("div", { className: "min-h-screen bg-background flex items-center justify-center", children: _jsx(Card, { className: "w-full max-w-md mx-4", children: _jsxs(CardContent, { className: "p-6 text-center", children: [_jsx(User, { className: "w-12 h-12 mx-auto mb-4 text-muted-foreground" }), _jsx("h2", { className: "text-xl font-semibold mb-2", children: "Not Signed In" }), _jsx("p", { className: "text-muted-foreground mb-4", children: "Please sign in to view your contribution dashboard." }), _jsx(Button, { onClick: () => setLocation("/"), children: "Go Home" })] }) }) }));
    }
    if (isLoading) {
        return (_jsx("div", { className: "min-h-screen bg-background flex items-center justify-center", children: _jsx("div", { className: "animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" }) }));
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
    }, {});
    const handleSignOut = () => {
        logout();
        setLocation('/');
    };
    return (_jsxs("div", { className: "min-h-screen bg-background", children: [_jsx("div", { className: "bg-gradient-to-r from-primary to-accent text-white p-4 sm:p-6 lg:p-8", children: _jsx("div", { className: "max-w-6xl mx-auto", children: _jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsx("div", { className: "flex items-center space-x-4", children: _jsxs(Button, { variant: "ghost", size: "sm", onClick: () => setLocation(returnTo), className: "text-white hover:bg-white/20", children: [_jsx(ArrowLeft, { className: "w-4 h-4 mr-2" }), "Back"] }) }), _jsxs("div", { className: "flex items-center space-x-4", children: [_jsx(Avatar, { className: "w-12 h-12", children: user.profileImageUrl ? (_jsx(AvatarImage, { src: user.profileImageUrl, alt: user.name })) : (_jsx(AvatarFallback, { className: "bg-white/20 text-white", children: user.name.split(' ').map(n => n[0]).join('').toUpperCase() })) }), _jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold", children: user.name }), _jsx("p", { className: "text-white/90", children: "Contribution Dashboard" })] })] })] }) }) }), _jsxs("div", { className: "max-w-6xl mx-auto p-4 sm:p-6 lg:p-8", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6", children: [_jsx(Card, { children: _jsx(CardContent, { className: "p-4 sm:p-6", children: _jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("div", { className: "p-2 bg-green-100 rounded-lg", children: _jsx(DollarSign, { className: "w-6 h-6 text-green-600" }) }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-muted-foreground", children: "Total Contributed" }), _jsxs("p", { className: "text-2xl font-bold", children: ["$", totalContributed.toFixed(2)] })] })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "p-4 sm:p-6", children: _jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("div", { className: "p-2 bg-blue-100 rounded-lg", children: _jsx(User, { className: "w-6 h-6 text-blue-600" }) }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-muted-foreground", children: "Children Helped" }), _jsx("p", { className: "text-2xl font-bold", children: totalChildren })] })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "p-4 sm:p-6", children: _jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("div", { className: "p-2 bg-purple-100 rounded-lg", children: _jsx(Gift, { className: "w-6 h-6 text-purple-600" }) }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-muted-foreground", children: "Total Gifts" }), _jsx("p", { className: "text-2xl font-bold", children: totalGifts })] })] }) }) })] }), _jsxs(Tabs, { value: activeTab, onValueChange: setActiveTab, children: [_jsxs(TabsList, { className: "grid w-full grid-cols-2", children: [_jsx(TabsTrigger, { value: "overview", children: "Overview" }), _jsx(TabsTrigger, { value: "timeline", children: "Timeline" })] }), _jsx(TabsContent, { value: "overview", className: "space-y-6", children: _jsxs("div", { children: [_jsx("h2", { className: "text-xl font-semibold mb-4", children: "Children You've Helped" }), Object.keys(giftsByChild).length === 0 ? (_jsx(Card, { children: _jsxs(CardContent, { className: "p-8 text-center", children: [_jsx(Heart, { className: "w-12 h-12 mx-auto mb-4 text-muted-foreground" }), _jsx("h3", { className: "text-lg font-semibold mb-2", children: "No Contributions Yet" }), _jsx("p", { className: "text-muted-foreground mb-4", children: "Start making a difference by sending your first investment gift!" }), _jsx(Button, { onClick: () => setLocation("/"), children: "Find a Child to Help" })] }) })) : (_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: Object.entries(giftsByChild).map(([childId, data]) => (_jsxs(Card, { className: "cursor-pointer hover:shadow-md transition-shadow", children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center justify-between", children: [_jsx("span", { children: data.child?.name || 'Unknown Child' }), _jsxs(Badge, { variant: "secondary", children: [data.gifts.length, " gift", data.gifts.length !== 1 ? 's' : ''] })] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-sm text-muted-foreground", children: "Total Contributed:" }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("span", { className: "font-semibold", children: ["$", data.totalContributed.toFixed(2)] }), data.pendingCount > 0 && (_jsx("span", { title: `${data.pendingCount} gift(s) pending approval`, children: _jsx(Clock, { className: "w-4 h-4 text-amber-500" }) }))] })] }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-sm text-muted-foreground", children: "Last Gift:" }), _jsx("span", { className: "text-sm", children: formatDistanceToNow(new Date(data.gifts[0]?.createdAt || Date.now()), { addSuffix: true }) })] }), data.pendingCount > 0 && (_jsxs("div", { className: "flex items-center gap-2 text-xs text-amber-600 bg-amber-50 p-2 rounded", children: [_jsx(AlertCircle, { className: "w-3 h-3" }), _jsxs("span", { children: [data.pendingCount, " gift", data.pendingCount !== 1 ? 's' : '', " pending custodian approval"] })] })), _jsx(Button, { variant: "outline", size: "sm", className: "w-full", onClick: () => setLocation(`/gift/${data.child?.giftCode}`), children: "Send Another Gift" })] }) })] }, childId))) }))] }) }), _jsx(TabsContent, { value: "timeline", className: "space-y-6", children: _jsxs("div", { children: [_jsx("h2", { className: "text-xl font-semibold mb-4", children: "Your Contribution Timeline" }), allGifts.length === 0 ? (_jsx(Card, { children: _jsxs(CardContent, { className: "p-8 text-center", children: [_jsx(Clock, { className: "w-12 h-12 mx-auto mb-4 text-muted-foreground" }), _jsx("h3", { className: "text-lg font-semibold mb-2", children: "No Contributions Yet" }), _jsx("p", { className: "text-muted-foreground", children: "Your contribution timeline will appear here once you start sending gifts." })] }) })) : (_jsx("div", { className: "space-y-4", children: allGifts
                                                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                                                .map((gift) => (_jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-start space-x-3", children: [_jsx(Avatar, { className: "w-10 h-10", children: user.profileImageUrl ? (_jsx(AvatarImage, { src: user.profileImageUrl, alt: user.name })) : (_jsx(AvatarFallback, { className: "bg-green-500 text-white", children: user.name.split(' ').map(n => n[0]).join('').toUpperCase() })) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-2", children: [_jsxs("h3", { className: "font-bold text-base", children: ["Gift to ", gift.child?.name || 'Unknown Child'] }), _jsxs("div", { className: "flex items-center gap-2", children: [gift.status === 'pending' && (_jsxs(Badge, { variant: "outline", className: "text-xs bg-amber-50 text-amber-700 border-amber-200", children: [_jsx(Clock, { className: "w-3 h-3 mr-1" }), "Pending Approval"] })), gift.status === 'approved' && (_jsxs(Badge, { variant: "outline", className: "text-xs bg-green-50 text-green-700 border-green-200", children: [_jsx(CheckCircle, { className: "w-3 h-3 mr-1" }), "Approved"] })), gift.status === 'rejected' && (_jsxs(Badge, { variant: "outline", className: "text-xs bg-red-50 text-red-700 border-red-200", children: [_jsx(AlertCircle, { className: "w-3 h-3 mr-1" }), "Rejected"] })), _jsx(Badge, { variant: "outline", className: "text-xs w-fit", children: formatDistanceToNow(new Date(gift.createdAt), { addSuffix: true }) })] })] }), _jsxs("div", { className: "space-y-1", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(TrendingUp, { className: "w-4 h-4 text-green-600" }), _jsxs("span", { className: "font-semibold", children: ["$", parseFloat(gift.amount).toFixed(2)] }), _jsx("span", { className: "text-muted-foreground", children: "\u2022" }), _jsxs("span", { className: "text-sm text-muted-foreground", children: [gift.investment.symbol, " - ", gift.investment.name] })] }), gift.message && (_jsxs("p", { className: "text-sm text-muted-foreground mt-1", children: ["\"", gift.message, "\""] }))] })] })] }) }) }, gift.id))) }))] }) })] }), _jsx("div", { className: "mt-8 mb-8 flex justify-center", children: _jsxs(Button, { variant: "outline", onClick: handleSignOut, className: "w-full max-w-md", children: [_jsx(LogOut, { className: "w-5 h-5 mr-2" }), "Sign Out"] }) })] })] }));
}
