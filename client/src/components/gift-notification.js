import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Gift, X, Eye, Heart } from "lucide-react";
// Mock parent ID - in a real app this would come from authentication
const MOCK_PARENT_ID = "parent-1";
export default function GiftNotification() {
    const [isVisible, setIsVisible] = useState(true);
    const [, setLocation] = useLocation();
    // Mock parent ID - in a real app this would come from authentication
    const MOCK_PARENT_ID = "parent-1";
    // Fetch children to get recent gifts
    const { data: children = [] } = useQuery({
        queryKey: ["/api/children", MOCK_PARENT_ID],
    });
    // Fetch recent gifts for all children
    const { data: allGifts = [], isLoading: giftsLoading } = useQuery({
        queryKey: ["/api/all-gifts", children.map(c => c.id)],
        queryFn: async () => {
            if (children.length === 0)
                return [];
            const giftPromises = children.map((child) => fetch(`/api/gifts/${child.id}`).then(res => res.json()));
            const giftArrays = await Promise.all(giftPromises);
            return giftArrays.flat().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        },
        enabled: children.length > 0,
    });
    // Get the most recent unviewed gift
    const recentGift = allGifts.find((gift) => !gift.isViewed && gift.status === 'approved') || null;
    const handleDismiss = () => {
        setIsVisible(false);
    };
    const handleViewGift = () => {
        if (recentGift) {
            setLocation(`/timeline/${recentGift.childId}`);
        }
    };
    const handleSendThankYou = () => {
        if (recentGift) {
            setLocation(`/timeline/${recentGift.childId}`);
        }
    };
    // Don't show if not visible, no recent gift, or still loading
    if (!isVisible || !recentGift || giftsLoading || children.length === 0) {
        return null;
    }
    return (_jsx(Card, { className: "gift-card celebration-animation border-0 bg-transparent shadow-none", children: _jsxs(CardContent, { className: "p-6 bg-transparent", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("div", { className: "w-12 h-12 bg-white rounded-full flex items-center justify-center", children: _jsx(Gift, { className: "w-6 h-6 text-secondary" }) }), _jsxs("div", { children: [_jsx("h3", { className: "font-bold text-white text-base", children: "New Gift Received!" }), _jsxs("p", { className: "text-white text-sm font-medium", children: ["From ", recentGift.giftGiverName] })] })] }), _jsx("button", { onClick: handleDismiss, className: "text-white/80 hover:text-white transition-colors", "data-testid": "button-dismiss-notification", children: _jsx(X, { className: "w-5 h-5" }) })] }), _jsxs("div", { className: "bg-white/20 rounded-lg p-4 mb-4", children: [_jsxs("div", { className: "flex justify-between items-start mb-2", children: [_jsxs("span", { className: "text-white font-semibold text-base", children: [recentGift.investment.name, " (", recentGift.investment.symbol, ")"] }), _jsxs("span", { className: "text-white font-bold text-base", children: ["$", parseFloat(recentGift.amount).toFixed(0)] })] }), _jsxs("p", { className: "text-white text-sm leading-relaxed", children: ["\"", recentGift.message, "\""] })] }), _jsxs("div", { className: "flex flex-col sm:flex-row gap-2 sm:gap-3", children: [_jsxs(Button, { onClick: handleViewGift, className: "flex-1 bg-white text-secondary font-semibold hover:bg-white/90 text-sm sm:text-base", "data-testid": "button-view-gift", children: [_jsx(Eye, { className: "w-4 h-4 mr-2" }), "View Gift"] }), _jsxs(Button, { onClick: handleSendThankYou, className: "flex-1 bg-white/20 text-white font-semibold hover:bg-white/30 border-0 text-sm sm:text-base", variant: "outline", "data-testid": "button-send-thanks", children: [_jsx(Heart, { className: "w-4 h-4 mr-2" }), "Say Thanks"] })] })] }) }));
}
