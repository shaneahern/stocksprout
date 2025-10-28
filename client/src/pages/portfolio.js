import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useQuery } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import MobileLayout from "@/components/mobile-layout";
import PortfolioGrowthChart from "@/components/portfolio-growth-chart";
import { ChildSelector } from "@/components/child-selector";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Gift, Clock, UserPlus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import { getStockLogoUrl, getFallbackLogoUrl } from "@/lib/stock-logo";
export default function Portfolio() {
    const [, params] = useRoute("/portfolio/:childId");
    const [, setLocation] = useLocation();
    const { user, token } = useAuth();
    const childId = params?.childId;
    // Fetch custodian's children first
    const { data: userChildren = [] } = useQuery({
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
            const isOwnChild = userChildren.some((child) => child.id === gift.child.id);
            if (!isOwnChild) {
                acc.push(gift.child);
            }
        }
        return acc;
    }, []);
    // Auto-redirect to first contributed child's portfolio if no childId and no own children
    useEffect(() => {
        if (!childId && contributedChildren.length > 0) {
            setLocation(`/portfolio/${contributedChildren[0].id}`);
        }
    }, [childId, contributedChildren, setLocation]);
    // Auto-redirect custodian to first child's portfolio if no childId
    useEffect(() => {
        if (user && !childId && userChildren.length > 0) {
            setLocation(`/portfolio/${userChildren[0].id}`);
        }
    }, [user, childId, userChildren, setLocation]);
    const { data: child } = useQuery({
        queryKey: ["/api/children/by-id", childId],
        enabled: !!childId,
    });
    const { data: allHoldings = [], isLoading: loadingHoldings } = useQuery({
        queryKey: ["/api/portfolio", childId],
        enabled: !!childId,
    });
    // Fetch gifts for this child to determine which investments are from this user
    const { data: childGifts = [] } = useQuery({
        queryKey: ["/api/gifts", childId],
        enabled: !!childId,
    });
    // Determine if this is the user's own child or a contributed child
    const isOwnChild = userChildren.some((child) => child.id === childId);
    // Get pending gifts for this user (contributor's own pending gifts)
    const userPendingGifts = isOwnChild
        ? childGifts.filter((gift) => gift.status === 'pending')
        : childGifts.filter((gift) => gift.contributorId === user?.id && gift.status === 'pending');
    // Filter holdings: if viewing a contributed child, recalculate based on user's gifts only
    const holdings = (isOwnChild ? allHoldings : allHoldings
        .filter((holding) => {
        // Check if this investment came from a gift by this user
        return childGifts.some((gift) => gift.contributorId === user?.id && gift.investmentId === holding.investmentId);
    })
        .map((holding) => {
        // Recalculate shares and values based on only user's gifts
        const userGiftsForInvestment = childGifts.filter((gift) => gift.contributorId === user?.id &&
            gift.investmentId === holding.investmentId &&
            gift.status === 'approved');
        const totalUserShares = userGiftsForInvestment.reduce((sum, gift) => sum + parseFloat(gift.shares || "0"), 0);
        const totalUserCost = userGiftsForInvestment.reduce((sum, gift) => sum + parseFloat(gift.amount || "0"), 0);
        const avgCost = totalUserShares > 0 ? totalUserCost / totalUserShares : 0;
        const currentValue = totalUserShares * parseFloat(holding.investment?.currentPrice || holding.currentPrice || "0");
        return {
            ...holding,
            shares: totalUserShares.toFixed(6),
            averageCost: avgCost.toFixed(2),
            currentValue: currentValue.toFixed(2),
        };
    }))
        .filter((holding) => {
        // Filter out holdings with 0 value (from pending gifts not yet approved)
        return parseFloat(holding.currentValue || "0") > 0;
    });
    const isLoading = loadingHoldings || contributorGifts === undefined;
    if (isLoading) {
        return (_jsx(MobileLayout, { currentTab: "portfolio", children: _jsx("div", { className: "flex items-center justify-center h-64", children: _jsx("div", { className: "animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" }) }) }));
    }
    // Show message for custodians with no children yet
    if (user && !childId && userChildren.length === 0) {
        return (_jsx(MobileLayout, { currentTab: "portfolio", children: _jsx(Card, { children: _jsxs(CardContent, { className: "p-8 text-center", children: [_jsx(User, { className: "w-12 h-12 mx-auto mb-4 text-muted-foreground" }), _jsx("h3", { className: "text-lg font-semibold mb-2", children: "No Children Added Yet" }), _jsx("p", { className: "text-muted-foreground mb-4", children: "Add your first child to start building their investment portfolio." }), _jsx(Button, { onClick: () => setLocation("/add-child"), children: "Add Your First Child" })] }) }) }));
    }
    // Show message if no child is selected and user has no children
    if (!childId && contributedChildren.length === 0 && userChildren.length === 0) {
        return (_jsx(MobileLayout, { currentTab: "portfolio", children: _jsx(Card, { children: _jsxs(CardContent, { className: "p-8 text-center", children: [_jsx(User, { className: "w-12 h-12 mx-auto mb-4 text-muted-foreground" }), _jsx("h3", { className: "text-lg font-semibold mb-2", children: "No Portfolio to Display" }), _jsx("p", { className: "text-muted-foreground mb-4", children: "You haven't added any children or contributed to any children yet." }), _jsx(Button, { onClick: () => setLocation("/"), children: "Go to Home" })] }) }) }));
    }
    const totalValue = holdings.reduce((sum, holding) => sum + parseFloat(holding.currentValue || "0"), 0);
    const totalCost = holdings.reduce((sum, holding) => sum + (parseFloat(holding.shares || "0") * parseFloat(holding.averageCost || "0")), 0);
    const totalGain = totalValue - totalCost;
    const totalGainPercent = totalCost > 0 ? (totalGain / totalCost) * 100 : 0;
    const handleImageError = (e, symbol) => {
        const target = e.currentTarget;
        // Prevent infinite loop if fallback also fails
        if (!target.src.startsWith('data:')) {
            target.src = getFallbackLogoUrl(symbol);
        }
    };
    return (_jsx(MobileLayout, { currentTab: "portfolio", children: _jsxs("div", { className: "space-y-6 pb-16", children: [childId && (_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "text-3xl font-bold mb-1", "data-testid": "text-portfolio-value", children: ["$", totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })] }), _jsx("div", { className: "flex items-center gap-2", children: _jsxs("span", { className: "text-sm font-medium text-muted-foreground", "data-testid": "text-portfolio-gain", children: [totalGain >= 0 ? '+' : '', "$", totalGain.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }), " Total Gain"] }) })] }), _jsx(ChildSelector, { currentChildId: childId, redirectPath: "portfolio" })] })), !childId && (_jsx("div", { children: _jsxs("div", { className: "text-center mb-6", children: [_jsxs("div", { className: "text-3xl font-bold mb-2", "data-testid": "text-portfolio-value", children: ["$", totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })] }), _jsx("div", { className: "flex items-center justify-center gap-2", children: _jsxs("span", { className: "text-sm font-medium text-muted-foreground", "data-testid": "text-portfolio-gain", children: [totalGain >= 0 ? '+' : '', "$", totalGain.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }), " Total Gain"] }) })] }) })), _jsx(PortfolioGrowthChart, { currentValue: totalValue, ytdReturn: totalGainPercent }), userPendingGifts.length > 0 && (_jsx(Card, { className: "border-amber-500 bg-amber-50", children: _jsx(CardContent, { className: "pt-4", children: _jsxs("div", { className: "flex items-start gap-3", children: [_jsx(Clock, { className: "w-5 h-5 text-amber-600 mt-0.5" }), _jsx("div", { className: "flex-1", children: isOwnChild ? (_jsxs(_Fragment, { children: [_jsxs("p", { className: "text-sm font-semibold text-amber-900 mb-2", children: [userPendingGifts.length, " gift", userPendingGifts.length > 1 ? 's' : '', " waiting for your review"] }), _jsx("div", { className: "space-y-2", children: userPendingGifts.map((gift) => (_jsxs("div", { className: "bg-white/50 rounded p-2 text-xs", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "font-medium", children: gift.investment?.name || 'Investment' }), _jsxs("span", { className: "font-semibold", children: ["$", parseFloat(gift.amount).toFixed(2)] })] }), _jsxs("div", { className: "text-amber-700 mt-1", children: ["From ", gift.giftGiverName, " \u2022 Awaiting your review"] })] }, gift.id))) }), _jsx("p", { className: "text-xs text-amber-700 mt-2", children: "Click the notification bell to approve or reject" })] })) : (_jsxs(_Fragment, { children: [_jsxs("p", { className: "text-sm font-semibold text-amber-900 mb-2", children: [userPendingGifts.length, " gift", userPendingGifts.length > 1 ? 's' : '', " pending approval"] }), _jsx("div", { className: "space-y-2", children: userPendingGifts.map((gift) => (_jsxs("div", { className: "bg-white/50 rounded p-2 text-xs", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "font-medium", children: gift.investment?.name || 'Investment' }), _jsxs("span", { className: "font-semibold", children: ["$", parseFloat(gift.amount).toFixed(2)] })] }), _jsx("div", { className: "text-amber-700 mt-1", children: "Awaiting custodian approval" })] }, gift.id))) }), _jsx("p", { className: "text-xs text-amber-700 mt-2", children: "These investments will appear in the portfolio once approved by the custodian." })] })) })] }) }) })), user && childId && (_jsxs("div", { className: "flex flex-col gap-2 -mt-2 mb-2", children: [_jsxs(Button, { onClick: () => setLocation(`/gift/${child?.giftLinkCode}`), className: "w-full text-white font-semibold text-[15px] hover:opacity-90 rounded-[5px]", style: { backgroundColor: '#328956', height: '29px' }, children: [_jsx(Gift, { className: "w-4 h-4 mr-2" }), "Send Gift"] }), _jsxs(Button, { onClick: () => {
                                // Generate sprout request link
                                const generateLink = async () => {
                                    try {
                                        const response = await fetch('/api/generate-gift-link', {
                                            method: 'POST',
                                            headers: {
                                                'Content-Type': 'application/json',
                                                'Authorization': `Bearer ${token}`,
                                            },
                                            body: JSON.stringify({ childId }),
                                        });
                                        const data = await response.json();
                                        // Use the same SMS sharing logic as the child card
                                        const childName = child?.firstName && child?.lastName
                                            ? `${child.firstName} ${child.lastName}`
                                            : 'Child';
                                        const smsMessage = `🎁 You're invited to send a gift to ${childName}! Give the gift of investment: ${data.giftLink}`;
                                        try {
                                            await navigator.share({
                                                title: `Send a gift to ${childName}`,
                                                text: smsMessage,
                                                url: data.giftLink
                                            });
                                        }
                                        catch (error) {
                                            // Fallback - copy to clipboard
                                            await navigator.clipboard.writeText(smsMessage);
                                        }
                                    }
                                    catch (error) {
                                        console.error('Failed to generate gift link:', error);
                                    }
                                };
                                generateLink();
                            }, className: "w-full text-[#FDFDFD] font-semibold text-[15px] hover:opacity-90 rounded-[5px]", style: { backgroundColor: '#265FDC', height: '29px' }, children: [_jsx(UserPlus, { className: "w-4 h-4 mr-2" }), "Sprout Request"] })] })), childId && contributedChildren.some((c) => c.id === childId) && !userChildren.some((c) => c.id === childId) && (_jsx("div", { className: "flex flex-col gap-2 -mt-2 mb-2", children: _jsxs(Button, { onClick: () => setLocation(`/gift/${child?.giftLinkCode}`), className: "flex-1 text-white font-semibold text-[15px] hover:opacity-90 rounded-[5px]", style: { backgroundColor: '#328956', height: '29px' }, children: [_jsx(Gift, { className: "w-4 h-4 mr-2" }), "Send Another Gift to ", child?.firstName && child?.lastName ? `${child.firstName} ${child.lastName}` : 'Child'] }) })), _jsxs("div", { className: "space-y-3", children: [_jsx("h2", { className: "text-[15px] font-semibold", children: "Holdings" }), holdings.map((holding) => {
                            const currentValue = parseFloat(holding.currentValue || "0");
                            const cost = parseFloat(holding.shares || "0") * parseFloat(holding.averageCost || "0");
                            const gain = currentValue - cost;
                            const gainPercent = cost > 0 ? (gain / cost) * 100 : 0;
                            return (_jsx(Card, { "data-testid": `card-holding-${holding.id}`, className: "border border-border shadow-sm", children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("div", { className: "flex items-center gap-4 flex-1", children: holding.investment?.symbol ? (_jsxs(_Fragment, { children: [_jsx("div", { className: "w-12 h-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden", children: _jsx("img", { src: getStockLogoUrl(holding.investment.symbol, holding.investment.name), alt: `${holding.investment.symbol} logo`, className: "w-full h-full object-contain p-1", onError: (e) => handleImageError(e, holding.investment.symbol) }) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("div", { className: "font-bold text-lg", children: holding.investment.symbol }), _jsxs("div", { className: "text-sm text-muted-foreground", children: [parseFloat(holding.shares).toFixed(0), " shares"] })] })] })) : (_jsxs("div", { className: "flex items-center gap-4 flex-1", children: [_jsx("div", { className: "w-12 h-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 text-xl font-bold text-muted-foreground", children: "?" }), _jsxs("div", { className: "flex-1", children: [_jsx("div", { className: "font-bold text-lg", children: "Unknown" }), _jsx("div", { className: "text-sm text-muted-foreground", children: "No data" })] })] })) }), _jsxs("div", { className: "text-right flex-shrink-0 ml-4", children: [_jsxs("div", { className: "font-bold text-lg", children: ["$", currentValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })] }), _jsxs("div", { className: `text-sm font-medium ${gain >= 0 ? 'text-green-600' : 'text-red-600'}`, children: [gain >= 0 ? '+' : '', "$", gain.toFixed(2)] })] }), _jsxs("div", { className: "ml-4 px-3 py-1.5 rounded-lg font-bold text-sm text-white", style: {
                                                    backgroundColor: gain >= 0 ? '#34A853' : '#EF5252'
                                                }, children: [gainPercent >= 0 ? '+' : '', gainPercent.toFixed(2), "%"] })] }) }) }, holding.id));
                        }), holdings.length === 0 && (_jsx(Card, { children: _jsx(CardContent, { className: "pt-6 text-center", children: _jsx("p", { className: "text-muted-foreground", children: "No investments yet" }) }) }))] })] }) }));
}
