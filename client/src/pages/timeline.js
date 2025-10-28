import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import MobileLayout from "@/components/mobile-layout";
import { VideoPlayerModal } from "@/components/video-player-modal";
import { VideoReelModal } from "@/components/video-reel-modal";
import { ChildSelector } from "@/components/child-selector";
import { ThankYouModal } from "@/components/thank-you-modal";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Gift, PlayCircle, Heart, Sprout, AlertCircle, User } from "lucide-react";
// Custom Leaf Icon Component matching the design
const CustomLeafIcon = ({ className }) => (_jsx("svg", { viewBox: "0 0 24 24", fill: "currentColor", className: className, children: _jsx("path", { d: "M12 2C8 2 6 4 6 8c0 2 1 4 2 5.5 1 1.5 2 2.5 2 3.5 0 1.5-1 2.5-2 2.5-1 0-2-1-3-2.5C4 16 3 14 3 12c0-2 1-3 2-4C6 7 8 5 12 5s6 2 7 3c1 1 2 2 2 4 0 2-1 4-2 5.5-1 1.5-2 2.5-3 2.5-1 0-2-1-2-2.5 0-1 1-2 2-3.5 1-1.5 2-3.5 2-5.5 0-4-2-6-6-6z" }) }));
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { apiRequest, queryClient } from "@/lib/queryClient";
export default function Timeline() {
    const [, params] = useRoute("/timeline/:childId");
    const [, setLocation] = useLocation();
    const childId = params?.childId;
    const { toast } = useToast();
    const { user, token } = useAuth();
    const [videoModalOpen, setVideoModalOpen] = useState(false);
    const [currentVideo, setCurrentVideo] = useState(null);
    const [videoReelOpen, setVideoReelOpen] = useState(false);
    const [thankYouModalOpen, setThankYouModalOpen] = useState(false);
    const [currentGift, setCurrentGift] = useState(null);
    // Fetch custodian's children first
    const { data: userChildren = [] } = useQuery({
        queryKey: ["/api/children", user?.id],
        enabled: !!user?.id,
    });
    // Fetch children that user has contributed to (gifts they've given)
    const { data: userGifts = [] } = useQuery({
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
    // Extract unique children from user's gifts (excluding own children)
    const contributedChildren = userGifts.reduce((acc, gift) => {
        if (gift.child && !acc.find((c) => c.id === gift.child.id)) {
            // Only include if this is not one of the user's own children
            const isOwnChild = userChildren.some((child) => child.id === gift.child.id);
            if (!isOwnChild) {
                acc.push(gift.child);
            }
        }
        return acc;
    }, []);
    // Auto-redirect custodian to first child's timeline if no childId
    useEffect(() => {
        if (user && !childId && userChildren.length > 0) {
            setLocation(`/timeline/${userChildren[0].id}`);
        }
    }, [user, childId, userChildren, setLocation]);
    const { data: allGifts = [], isLoading } = useQuery({
        queryKey: ["/api/gifts", childId],
        enabled: !!childId,
    });
    // Determine if this is the user's own child or a contributed child
    const isOwnChild = userChildren.some((child) => child.id === childId);
    // Filter gifts based on view type
    // For contributed children, only show gifts from this user
    const gifts = allGifts.filter((gift) => {
        if (isOwnChild)
            return true; // Custodians see all gifts (approved and pending)
        return gift.contributorId === user?.id; // Contributors only see their own gifts
    });
    const pendingGifts = isOwnChild
        ? allGifts.filter((gift) => gift.status === 'pending')
        : gifts.filter((gift) => gift.status === 'pending'); // Contributors see their pending gifts
    const isLoadingData = isLoading;
    if (isLoadingData) {
        return (_jsx(MobileLayout, { currentTab: "timeline", children: _jsx("div", { className: "flex items-center justify-center h-64", children: _jsx("div", { className: "animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" }) }) }));
    }
    // Show message for custodians with no children yet
    if (user && !childId && userChildren.length === 0) {
        return (_jsx(MobileLayout, { currentTab: "timeline", children: _jsx(Card, { children: _jsxs(CardContent, { className: "p-8 text-center", children: [_jsx(User, { className: "w-12 h-12 mx-auto mb-4 text-muted-foreground" }), _jsx("h3", { className: "text-lg font-semibold mb-2", children: "No Children Added Yet" }), _jsx("p", { className: "text-muted-foreground mb-4", children: "Add your first child to start tracking their investment timeline." }), _jsx(Button, { onClick: () => setLocation("/add-child"), children: "Add Your First Child" })] }) }) }));
    }
    // Show message if user has no timeline to display
    if (user && !childId && userChildren.length === 0 && contributedChildren.length === 0) {
        return (_jsx(MobileLayout, { currentTab: "timeline", children: _jsx(Card, { children: _jsxs(CardContent, { className: "p-8 text-center", children: [_jsx(User, { className: "w-12 h-12 mx-auto mb-4 text-muted-foreground" }), _jsx("h3", { className: "text-lg font-semibold mb-2", children: "No Timeline to Display" }), _jsx("p", { className: "text-muted-foreground mb-4", children: "Add your own children or contribute to someone's investment account to see timelines here." }), _jsx(Button, { onClick: () => setLocation("/"), children: "Go to Home" })] }) }) }));
    }
    const handlePlayVideo = (videoUrl, giverName) => {
        setCurrentVideo({ url: videoUrl, giverName });
        setVideoModalOpen(true);
    };
    const handlePlayVideoReel = () => {
        setVideoReelOpen(true);
    };
    const handleSendThankYou = (giftId, giverName) => {
        setCurrentGift({ id: giftId, giverName });
        setThankYouModalOpen(true);
    };
    const handleSendThankYouMessage = async (message) => {
        if (!currentGift)
            return;
        try {
            const response = await apiRequest("POST", "/api/thank-you", {
                giftId: currentGift.id,
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
        }
        catch (error) {
            toast({
                title: "Error",
                description: "Failed to send thank you message.",
                variant: "destructive",
            });
        }
    };
    // Sort gifts chronologically for growth calculation (oldest first)
    const chronologicalGifts = [...gifts].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
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
    // Sort for display (most recent first at the top)
    const sortedGiftsWithCumulative = [...giftsWithCumulative].reverse();
    // Prepare videos for reel (sorted chronologically for better story flow)
    const videoReelItems = gifts
        .filter(gift => gift.videoMessageUrl)
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        .map(gift => ({
        id: gift.id,
        videoUrl: gift.videoMessageUrl,
        giverName: gift.giftGiverName,
        message: gift.message || undefined,
        investmentName: gift.investment?.name,
        amount: parseFloat(gift.amount)
    }));
    return (_jsxs(MobileLayout, { currentTab: "timeline", children: [currentVideo && (_jsx(VideoPlayerModal, { isOpen: videoModalOpen, onClose: () => {
                    setVideoModalOpen(false);
                    setCurrentVideo(null);
                }, videoUrl: currentVideo.url, giftGiverName: currentVideo.giverName })), _jsx(VideoReelModal, { isOpen: videoReelOpen, onClose: () => setVideoReelOpen(false), videos: videoReelItems }), _jsx(ThankYouModal, { isOpen: thankYouModalOpen, onClose: () => {
                    setThankYouModalOpen(false);
                    setCurrentGift(null);
                }, onSend: handleSendThankYouMessage, giftGiverName: currentGift?.giverName }), _jsxs("div", { className: "space-y-6 pb-16", children: [_jsxs("div", { className: "flex items-center justify-between gap-2", children: [gifts.some(gift => gift.videoMessageUrl) && (_jsxs("div", { className: "relative flex-shrink-0", children: [_jsxs("button", { onClick: handlePlayVideoReel, className: "w-36 bg-green-100 rounded-full overflow-hidden flex items-center hover:bg-green-200 transition-colors", style: { borderColor: '#328956', borderWidth: '1px', borderStyle: 'solid' }, children: [_jsx("div", { className: "bg-green-700 flex items-center justify-center py-1.5 px-1.5 relative z-10 rounded-l-full", children: _jsx("svg", { width: "19", height: "20", viewBox: "0 0 19 20", fill: "none", xmlns: "http://www.w3.org/2000/svg", className: "w-4 h-4", children: _jsx("path", { d: "M4 0C6.68928 0 9.02435 1.51653 10.1967 3.74104C11.374 2.08252 13.3105 1 15.4999 1H18.9999V3.5C18.9999 7.08985 16.0899 10 12.5 10H11V11H15.9999V18C15.9999 19.1046 15.1046 20 14 20H6C4.89543 20 4 19.1046 4 18V11H8.99995V9H7C3.134 9 0 5.86599 0 2V0H4ZM14 13H6V18H14V13ZM16.9999 3H15.4999C13.0147 3 11 5.01472 11 7.5V8H12.5C14.9853 8 16.9999 5.98528 16.9999 3.5V3ZM4 2H2C2 4.76142 4.23857 7 7 7H8.99995C8.99995 4.23858 6.76142 2 4 2Z", fill: "white" }) }) }), _jsxs("div", { className: "flex-1 bg-green-100 flex items-center justify-center gap-0.5 py-1.5 px-1 rounded-r-full", children: [_jsx(PlayCircle, { className: "w-4 h-4 text-black" }), _jsx("span", { className: "text-black font-medium text-[11px]", children: "Full Video Reel" })] })] }), _jsx("div", { className: "absolute left-3 top-full w-[5px] h-10", style: { backgroundColor: '#295235' } })] })), childId && _jsx(ChildSelector, { currentChildId: childId, redirectPath: "timeline" })] }), user && isOwnChild && pendingGifts.length > 0 && (_jsx(Card, { className: "border-orange-500 bg-orange-50", children: _jsx(CardContent, { className: "pt-4", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx(AlertCircle, { className: "w-5 h-5 text-orange-600" }), _jsxs("div", { className: "flex-1", children: [_jsxs("p", { className: "text-sm font-semibold text-orange-900", children: [pendingGifts.length, " gift", pendingGifts.length > 1 ? 's' : '', " waiting for your review"] }), _jsx("p", { className: "text-xs text-orange-700", children: "Click the notification bell to approve or reject" })] })] }) }) })), gifts.length === 0 ? (_jsx(Card, { children: _jsxs(CardContent, { className: "pt-6 text-center", children: [_jsx("div", { className: "w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4", children: _jsx(Sprout, { className: "w-8 h-8 text-green-600" }) }), _jsx("p", { className: "text-muted-foreground font-medium mb-2", children: "No gifts yet \u2014 plant the first seed!" }), _jsx("p", { className: "text-xs text-muted-foreground", children: "Share your gift link to start growing" })] }) })) : (_jsxs("div", { className: "relative max-w-full overflow-hidden", children: [_jsx("div", { className: "absolute left-3 top-0 bottom-0 w-[5px]", style: { backgroundColor: '#295235' } }), _jsx("div", { className: "space-y-6", children: sortedGiftsWithCumulative.map((gift, index) => (_jsxs("div", { className: "relative flex items-start gap-0 max-w-full", children: [_jsx("div", { className: "relative z-10 flex-shrink-0 ml-4", children: _jsx("svg", { width: "34", height: "22", viewBox: "0 0 34 22", fill: "none", xmlns: "http://www.w3.org/2000/svg", className: "w-6 h-6 mt-2", children: _jsx("path", { d: "M33.4294 7.16343L32.2758 9.72206C26.7227 22.0385 17.4939 24.094 9.2207 19.7289L4.53044 17.2542C3.80189 18.3142 3.12742 19.5341 2.49697 20.9324L0.000316043 19.6151C0.786327 17.8718 1.64462 16.3647 2.58446 15.0687C3.04315 13.2613 3.91243 10.9383 5.19155 8.10127C8.37716 1.0358 16.5485 -1.74311 23.4428 1.89438C25.9395 3.21164 27.8593 5.80822 33.4294 7.16343ZM22.2892 4.45301C16.7738 1.54303 10.2367 3.76615 7.68821 9.41853C7.47918 9.88215 7.28204 10.3304 7.09684 10.7628C9.80336 9.05918 12.9985 8.26877 16.79 8.09483L17.0272 10.9698C12.5223 11.1766 9.08895 12.301 6.34886 15.0461L10.3743 17.1703C17.8832 21.1321 24.9884 18.5889 29.5517 8.8987C27.762 8.1658 26.2197 7.21727 24.3926 5.87964C23.0552 4.90059 22.7895 4.71699 22.2892 4.45301Z", fill: "#328956" }) }) }), _jsx("div", { className: "relative z-10 flex-shrink-0", children: _jsxs("div", { className: "border-t border-l border-b rounded-l-xl px-1.5 py-1 text-center min-w-[50px]", style: {
                                                    backgroundColor: '#EEFFF5',
                                                    borderColor: '#328956',
                                                    borderWidth: '1px',
                                                    borderStyle: 'solid'
                                                }, children: [_jsxs("div", { className: "text-[10px] font-bold leading-tight", style: { color: '#328956' }, children: ["$", gift.cumulativeAmount?.toFixed(0) || '0'] }), _jsx("div", { className: "text-[10px] font-bold leading-tight", style: { color: '#328956' }, children: "Total" })] }) }), _jsx(Card, { className: "flex-1 min-w-0 shadow-sm border border-gray-200 bg-white rounded-l-none", children: _jsxs(CardContent, { className: "p-4", children: [_jsxs("div", { className: "flex items-center justify-between mb-3", children: [_jsxs("div", { className: "flex items-center gap-3", children: [(gift.contributor?.profileImageUrl || gift.giftGiverProfileImageUrl) ? (_jsxs(Avatar, { className: "w-10 h-10", children: [_jsx(AvatarImage, { src: gift.contributor?.profileImageUrl || gift.giftGiverProfileImageUrl || undefined, alt: gift.contributor?.name || gift.giftGiverName, className: "object-cover" }), _jsx(AvatarFallback, { className: `text-white text-sm font-semibold ${gift.contributor?.phone === null ?
                                                                                    'bg-gradient-to-br from-blue-500 to-blue-600' :
                                                                                    'bg-gradient-to-br from-green-500 to-green-600'}`, children: (gift.contributor?.name || gift.giftGiverName).split(' ').map((n) => n[0]).join('').toUpperCase() })] })) : (_jsx("div", { className: `w-10 h-10 rounded-full flex items-center justify-center ${gift.contributor?.phone === null ?
                                                                            'bg-gradient-to-br from-blue-500 to-blue-600' :
                                                                            'bg-gradient-to-br from-green-500 to-green-600'}`, children: gift.contributor?.phone === null ? (_jsx(User, { className: "w-5 h-5 text-white" })) : (_jsx(Gift, { className: "w-5 h-5 text-white" })) })), _jsxs("h3", { className: "font-semibold text-gray-900 text-sm", children: ["From ", gift.giftGiverName] })] }), gift.videoMessageUrl && (_jsxs(Button, { size: "sm", onClick: () => handlePlayVideo(gift.videoMessageUrl, gift.giftGiverName), className: "bg-[#265FDC] hover:bg-[#1e4db8] text-white border-0 flex items-center gap-1 rounded-[20px] py-1 px-3 text-[11px] font-semibold", children: [_jsx("div", { className: "w-4 h-4 border border-white rounded-full flex items-center justify-center", children: _jsx("svg", { className: "w-2 h-2 text-white", fill: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { d: "M8 5v14l11-7z" }) }) }), "Video"] }))] }), _jsxs("div", { className: "flex flex-wrap gap-1 mb-3", children: [_jsx(Badge, { variant: "outline", className: "text-[8px] bg-white text-gray-600 border border-gray-200 rounded-[20px] px-1.5 py-0.5 font-light", children: formatDistanceToNow(new Date(gift.createdAt), { addSuffix: true }) }), _jsxs(Badge, { variant: "outline", className: "text-[8px] border rounded-[20px] px-1.5 py-0.5 font-light", style: {
                                                                    backgroundColor: '#EEFFF5',
                                                                    borderColor: '#328956',
                                                                    color: '#328956'
                                                                }, children: [gift.investment?.name, " (", gift.investment?.symbol, ")"] }), _jsxs(Badge, { variant: "outline", className: "text-[8px] border rounded-[20px] px-1.5 py-0.5 font-light", style: {
                                                                    backgroundColor: '#EEFFF5',
                                                                    borderColor: '#328956',
                                                                    color: '#328956'
                                                                }, children: ["$", Math.round(parseFloat(gift.amount)), " (", parseFloat(gift.shares).toFixed(1), " shares)"] })] }), gift.message && (_jsx("div", { className: "bg-white border border-gray-200 rounded-lg p-3 mb-3", children: _jsxs("p", { className: "text-sm italic text-gray-700", children: ["\"", gift.message, "\""] }) })), user && !gift.thankYouSent && (_jsxs(Button, { size: "sm", variant: "outline", onClick: () => handleSendThankYou(gift.id, gift.giftGiverName), className: "w-full bg-[#F5F5F5] hover:bg-gray-200 text-gray-700 border border-[#C0C0C0] rounded-[5px] flex items-center justify-center gap-2 text-[9px] font-normal", "data-testid": `button-thank-you-${gift.id}`, children: [_jsx(Heart, { className: "w-4 h-4 text-black font-bold" }), "Say Thanks"] }))] }) })] }, gift.id))) })] }))] })] }));
}
