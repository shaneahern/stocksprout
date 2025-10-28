import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useRef } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Gift, Camera, Clock, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { generateSMSMessage, shareViaWebShare } from "@/lib/sms-utils";
import { calculateAge } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import TakePhotoModal from "@/components/take-photo-modal";
import PhotoEditorModal from "@/components/photo-editor-modal";
export default function ChildCard({ child, isContributedChild = false }) {
    const [, setLocation] = useLocation();
    const { toast } = useToast();
    const { user, token } = useAuth();
    // Camera state
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [isPhotoDialogOpen, setIsPhotoDialogOpen] = useState(false);
    const [isPhotoEditorOpen, setIsPhotoEditorOpen] = useState(false);
    const [tempImageUrl, setTempImageUrl] = useState("");
    const fileInputRef = useRef(null);
    // Calculate child's name and age
    const fullName = child.firstName && child.lastName
        ? `${child.firstName} ${child.lastName}`
        : child.name || 'Child';
    const age = child.birthdate ? calculateAge(child.birthdate) : child.age || 0;
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
                    description: `Choose how you want to share the gift link for ${fullName}.`,
                });
            }
            catch (error) {
                // Fallback if sharing failed or was cancelled
                toast({
                    title: "Share Ready",
                    description: `Gift link generated for ${fullName}. Use the share options to send it via SMS.`,
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
    // Handle photo taken from camera modal
    const handlePhotoTaken = (imageDataUrl) => {
        setTempImageUrl(imageDataUrl);
        setIsCameraOpen(false);
        setIsPhotoDialogOpen(false);
        setIsPhotoEditorOpen(true);
    };
    const handleGallerySelect = (e) => {
        const file = e.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const result = event.target?.result;
                setTempImageUrl(result);
                setIsPhotoDialogOpen(false);
                setIsPhotoEditorOpen(true);
            };
            reader.readAsDataURL(file);
        }
    };
    const handlePhotoEdited = async (croppedImageUrl) => {
        try {
            const response = await fetch(`/api/children/${child.id}/profile-photo`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ profileImageUrl: croppedImageUrl }),
            });
            if (!response.ok)
                throw new Error("Failed to update photo");
            queryClient.invalidateQueries({ queryKey: ["/api/children"] });
            toast({
                title: "Photo Updated!",
                description: `Profile photo for ${fullName} has been updated.`,
            });
            setIsPhotoEditorOpen(false);
            setTempImageUrl("");
        }
        catch (error) {
            toast({
                title: "Error",
                description: "Failed to update profile photo.",
                variant: "destructive",
            });
        }
    };
    const handleViewPortfolio = () => {
        console.log('Navigating to portfolio for child:', child.id);
        setLocation(`/portfolio/${child.id}`);
    };
    const handleShareGiftLink = () => {
        generateLinkMutation.mutate();
    };
    const handleSendGift = () => {
        setLocation(`/gift/${child.giftLinkCode || child.giftCode}`);
    };
    // Fetch real portfolio data
    const { data: allPortfolioData = [] } = useQuery({
        queryKey: ["/api/portfolio", child.id],
    });
    const { data: allGifts = [] } = useQuery({
        queryKey: ["/api/gifts", child.id],
    });
    // Filter data based on whether this is a contributed child
    const portfolioData = isContributedChild
        ? allPortfolioData
            .filter((holding) => {
            // Only show holdings from user's gifts
            return allGifts.some((gift) => gift.contributorId === user?.id && gift.investmentId === holding.investmentId);
        })
            .map((holding) => {
            // Recalculate shares and values based on only user's gifts
            const userGiftsForInvestment = allGifts.filter((gift) => gift.contributorId === user?.id &&
                gift.investmentId === holding.investmentId &&
                gift.status === 'approved');
            const totalUserShares = userGiftsForInvestment.reduce((sum, gift) => sum + parseFloat(gift.shares || "0"), 0);
            const totalUserCost = userGiftsForInvestment.reduce((sum, gift) => sum + parseFloat(gift.amount || "0"), 0);
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
        ? allGifts.filter((g) => g.contributorId === user?.id)
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
        giftsCount: gifts.filter((g) => g.status === 'approved').length, // Only count approved gifts
        investmentsCount: portfolioData.length,
        totalGain: Math.max(0, totalGain),
        monthlyGrowth: monthlyGrowth
    };
    return (_jsxs(_Fragment, { children: [_jsx(Card, { className: "border border-border shadow-sm hover:shadow-md transition-shadow", "data-testid": `card-child-${child.id}`, children: _jsxs(CardContent, { className: "p-5", children: [_jsxs("div", { className: "flex items-center space-x-4 mb-4", children: [_jsxs("div", { className: "relative", children: [_jsxs(Avatar, { className: "w-16 h-16 border-2 border-primary/20", children: [child.profileImageUrl && (_jsx(AvatarImage, { src: child.profileImageUrl, alt: fullName })), _jsx(AvatarFallback, { className: "text-lg font-bold", children: child.firstName?.charAt(0) || child.name?.charAt(0) || 'C' })] }), !isContributedChild && (_jsxs(_Fragment, { children: [_jsx("button", { type: "button", onClick: (e) => {
                                                        e.stopPropagation();
                                                        fileInputRef.current?.click();
                                                    }, className: "absolute -bottom-1 -right-1 bg-primary text-primary-foreground rounded-full shadow-md hover:bg-primary/90 transition-colors", style: {
                                                        width: '24px',
                                                        height: '24px',
                                                        padding: '12px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center'
                                                    }, "aria-label": "Add profile photo", children: _jsx(Camera, { className: "w-3 h-3", style: { position: 'absolute' } }) }), _jsx("input", { ref: fileInputRef, type: "file", accept: "image/*", onChange: handleGallerySelect, className: "hidden" })] }))] }), _jsxs("div", { className: "flex-1 cursor-pointer hover:opacity-80 transition-opacity min-h-[60px] flex flex-col justify-center", onClick: (e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        console.log('Name area clicked for child:', child.id);
                                        handleViewPortfolio();
                                    }, children: [_jsx("h3", { className: "font-semibold text-[13px] text-foreground leading-tight", style: { letterSpacing: '0.97%' }, children: fullName }), _jsxs("p", { className: "text-muted-foreground text-xs", children: ["Age ", age] })] }), _jsxs("div", { onClick: (e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        console.log('Stats area clicked for child:', child.id);
                                        handleViewPortfolio();
                                    }, className: "text-right cursor-pointer hover:opacity-80 transition-opacity", children: [_jsxs("div", { className: "flex items-center justify-end gap-2", children: [_jsxs("p", { className: "text-[20px] font-semibold text-foreground", "data-testid": `text-child-value-${child.id}`, children: ["$", (isContributedChild ? child.totalValue : portfolioStats.totalValue).toLocaleString()] }), isContributedChild && child.pendingCount > 0 && (_jsx("span", { title: `${child.pendingCount} gift(s) pending approval`, children: _jsx(Clock, { className: "w-5 h-5 text-amber-500" }) }))] }), _jsx("div", { className: "flex items-center justify-end mt-1", children: _jsxs("span", { className: "text-[13px] font-semibold", style: { color: '#328956' }, children: ["+", portfolioStats.monthlyGrowth, "% growth"] }) }), isContributedChild && child.pendingCount > 0 && (_jsxs(Badge, { variant: "outline", className: "text-xs bg-amber-50 text-amber-700 border-amber-200 mt-2", children: [_jsx(Clock, { className: "w-3 h-3 mr-1" }), child.pendingCount, " Pending Approval"] }))] })] }), _jsxs("div", { className: "flex flex-col gap-2", children: [_jsxs(Button, { onClick: (e) => {
                                        e.stopPropagation();
                                        handleSendGift();
                                    }, className: "w-full text-white font-semibold text-[15px] hover:opacity-90 rounded-[5px]", style: { backgroundColor: '#328956', height: '29px' }, "data-testid": `button-send-gift-${child.id}`, children: [_jsx(Gift, { className: "w-4 h-4 mr-2" }), _jsx("span", { children: "Send Gift" })] }), !isContributedChild && (_jsxs(Button, { onClick: (e) => {
                                        e.stopPropagation();
                                        handleShareGiftLink();
                                    }, disabled: generateLinkMutation.isPending, className: "w-full text-[#FDFDFD] font-semibold text-[15px] hover:opacity-90 rounded-[5px]", style: { backgroundColor: '#265FDC', height: '29px' }, "data-testid": `button-sprout-request-${child.id}`, children: [_jsx(UserPlus, { className: "w-4 h-4 mr-2" }), _jsx("span", { children: generateLinkMutation.isPending ? "Requesting..." : "Sprout Request" })] }))] })] }) }), _jsx(TakePhotoModal, { isOpen: isCameraOpen, onClose: () => setIsCameraOpen(false), onPhotoTaken: handlePhotoTaken, title: `Add Profile Photo for ${fullName}` }), _jsx(PhotoEditorModal, { isOpen: isPhotoEditorOpen, onClose: () => {
                    setIsPhotoEditorOpen(false);
                    setTempImageUrl("");
                }, imageUrl: tempImageUrl, onSave: handlePhotoEdited, title: `Edit Photo for ${fullName}` })] }));
}
