import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useQuery } from "@tanstack/react-query";
import MobileLayout from "@/components/mobile-layout";
import GiftNotification from "@/components/gift-notification";
import ChildCard from "@/components/child-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Gift } from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
export default function Home() {
    const [, setLocation] = useLocation();
    const { user, token } = useAuth();
    //Fetch custodian's children (children where user is parent)
    const { data: children = [], isLoading: loadingChildren } = useQuery({
        queryKey: ["/api/children", user?.id],
        enabled: !!user?.id,
    });
    // Fetch children that user has contributed to (gifts they've given)
    const { data: contributorGifts = [], isLoading: loadingGifts } = useQuery({
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
    const isLoading = loadingChildren || loadingGifts;
    // Extract unique children from contributor gifts (excluding own children)
    // Calculate total contributed and pending count per child (excluding rejected gifts)
    const contributedChildren = contributorGifts.reduce((acc, gift) => {
        if (gift.child) {
            const isOwnChild = children.some((child) => child.id === gift.child.id);
            if (!isOwnChild) {
                // Find existing child in accumulator
                let existingChild = acc.find((c) => c.id === gift.child.id);
                if (!existingChild) {
                    // Create new entry for this child
                    existingChild = {
                        id: gift.child.id,
                        firstName: gift.child.firstName,
                        lastName: gift.child.lastName,
                        name: gift.child.name, // Keep for backwards compatibility
                        giftLinkCode: gift.child.giftCode,
                        profileImageUrl: gift.child.profileImageUrl,
                        birthdate: gift.child.birthdate,
                        age: gift.child.age, // Keep for backwards compatibility
                        totalValue: 0, // This will be the sum of all gifts (excluding rejected)
                        totalGain: 0,
                        pendingCount: 0,
                        approvedCount: 0,
                    };
                    acc.push(existingChild);
                }
                // Add this gift's amount to the child's total (only if not rejected)
                if (gift.status !== 'rejected') {
                    existingChild.totalValue += parseFloat(gift.amount || '0');
                }
                // Track pending vs approved gifts
                if (gift.status === 'pending') {
                    existingChild.pendingCount++;
                }
                else if (gift.status === 'approved') {
                    existingChild.approvedCount++;
                }
            }
        }
        return acc;
    }, []);
    const handleAddChild = () => {
        setLocation("/add-child");
    };
    if (isLoading) {
        return (_jsx(MobileLayout, { currentTab: "home", children: _jsx("div", { className: "flex items-center justify-center h-64", children: _jsx("div", { className: "animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" }) }) }));
    }
    // Calculate total portfolio value
    const totalValue = children.reduce((sum, child) => sum + (child.totalValue || 0), 0);
    const totalGrowth = children.reduce((sum, child) => sum + (child.totalGain || 0), 0);
    return (_jsx(MobileLayout, { currentTab: "home", children: _jsxs("div", { className: "space-y-6 pb-16", children: [user && _jsx(GiftNotification, {}), user && _jsxs("div", { children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("h2", { className: "text-[15px] font-semibold text-foreground", children: "Your Sprouts" }), user && (_jsxs(Button, { onClick: handleAddChild, variant: "ghost", className: "text-primary font-semibold py-1", "data-testid": "button-add-child", children: [_jsx(Plus, { className: "w-4 h-4 mr-0.5" }), "Add Child"] }))] }), _jsx("div", { className: "space-y-4", children: children.length > 0 ? (children.map((child) => (_jsx(ChildCard, { child: child }, child.id)))) : user ? (_jsx(Card, { children: _jsx(CardContent, { className: "pt-6 pb-6 text-center", children: _jsxs("div", { className: "max-w-md mx-auto", children: [_jsx("h3", { className: "text-lg font-semibold mb-2", children: "No Sprouts Added Yet" }), _jsx("p", { className: "text-muted-foreground text-sm", children: "Start building your child's investment portfolio by adding them to StockSprout." })] }) }) })) : null })] }), user && (_jsxs("div", { children: [_jsxs("div", { className: "mb-4", children: [_jsx("h2", { className: "text-[15px] font-semibold text-foreground", children: "Sprouts You've Helped" }), _jsx("p", { className: "text-sm text-muted-foreground", children: contributedChildren.length > 0
                                        ? "View and send more gifts to these children"
                                        : "Start making a difference in other children's futures" })] }), _jsx("div", { className: "space-y-4", children: contributedChildren.length > 0 ? (contributedChildren.map((child) => (_jsx(ChildCard, { child: child, isContributedChild: true }, child.id)))) : (_jsxs("div", { className: "bg-white rounded-lg border border-border p-6 text-center", children: [_jsx("div", { className: "w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4", children: _jsx(Gift, { className: "w-8 h-8 text-accent" }) }), _jsx("h3", { className: "text-lg font-semibold mb-2", children: "No Children Helped Yet" }), _jsx("p", { className: "text-muted-foreground text-sm leading-relaxed", children: "When other parents invite you to contribute through a Sprout Request, you'll be able to share investment gifts to their children. All children you've helped will be tracked here so you can watch their investments grow!" })] })) })] }))] }) }));
}
