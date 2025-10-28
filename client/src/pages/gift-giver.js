import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import InvestmentSelector from "@/components/investment-selector";
import BrokerageTransferSelector from "@/components/brokerage-transfer-selector";
import VideoRecorder from "@/components/video-recorder";
import MockPaymentForm from "@/components/mock-payment-form";
import { RecurringContributionSetup } from "@/components/recurring-contribution-setup";
import { GiftGiverAuthModal } from "@/components/gift-giver-auth-modal";
import { CheckCircle, Gift, DollarSign, MessageSquare, CreditCard, Camera, ArrowLeftRight, ShoppingCart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import TakePhotoModal from "@/components/take-photo-modal";
import { getStockLogoUrl, getFallbackLogoUrl } from "@/lib/stock-logo";
import PhotoEditorModal from "@/components/photo-editor-modal";
export default function GiftGiver() {
    const [, params] = useRoute("/gift/:giftCode");
    const [, setLocation] = useLocation();
    const giftCode = params?.giftCode;
    const { toast } = useToast();
    const { user: authContributor, token: contributorToken, isLoading: authLoading } = useAuth();
    const [giftMode, setGiftMode] = useState("buy");
    const [selectedInvestment, setSelectedInvestment] = useState(null);
    const [amount, setAmount] = useState("150");
    const [shares, setShares] = useState("");
    const [message, setMessage] = useState("");
    const [videoUrl, setVideoUrl] = useState("");
    const [giftGiverName, setGiftGiverName] = useState("");
    const [giftGiverEmail, setGiftGiverEmail] = useState("");
    const [paymentId, setPaymentId] = useState(null);
    const [giftSent, setGiftSent] = useState(false);
    const [guestCompleted, setGuestCompleted] = useState(false);
    // Show auth modal only if not authenticated, not loading, and guest hasn't completed
    const shouldShowAuthModal = !authContributor && !authLoading && !guestCompleted;
    // Profile photo state
    const [profileImageUrl, setProfileImageUrl] = useState("");
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [isPhotoDialogOpen, setIsPhotoDialogOpen] = useState(false);
    const [isPhotoEditorOpen, setIsPhotoEditorOpen] = useState(false);
    const [tempImageUrl, setTempImageUrl] = useState("");
    const fileInputRef = useRef(null);
    const { data: child, isLoading } = useQuery({
        queryKey: ["/api/children/by-gift-code", giftCode],
        enabled: !!giftCode,
    });
    // Type guard for child data
    const typedChild = child;
    // Compute child's full name from firstName and lastName
    const childFullName = typedChild
        ? `${typedChild.firstName || ''} ${typedChild.lastName || ''}`.trim() || typedChild.name || 'this child'
        : 'this child';
    // Handle authentication
    const handleAuthenticated = (contributorData, isNewUser) => {
        // The AuthContext already handles the authentication state
        // We just need to pre-fill the form
        // Pre-fill form with contributor data
        setGiftGiverName(contributorData.name);
        setGiftGiverEmail(contributorData.email || '');
        setProfileImageUrl(contributorData.profileImageUrl || '');
        // If this is a guest (id starts with 'guest-'), mark guest as completed
        if (contributorData.id && contributorData.id.startsWith('guest-')) {
            setGuestCompleted(true);
        }
        // If it's a new user, we might want to connect them to this child for future gifts
        if (isNewUser && contributorData.id && !contributorData.id.startsWith('guest-')) {
            // TODO: Connect contributor to child for future gifts
            console.log('New contributor created:', contributorData);
        }
    };
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
        setProfileImageUrl(croppedImageUrl);
        setIsPhotoEditorOpen(false);
        setTempImageUrl("");
        try {
            // If user is authenticated and has a contributor ID, save to database
            if (authContributor?.id && contributorToken) {
                const response = await fetch(`/api/contributors/${authContributor.id}/profile-photo`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${contributorToken}`,
                    },
                    body: JSON.stringify({ profileImageUrl: croppedImageUrl }),
                });
                if (response.ok) {
                    toast({
                        title: "Profile Photo Updated",
                        description: "Your profile photo has been saved to your account.",
                    });
                }
                else {
                    throw new Error("Failed to save profile photo");
                }
            }
            else {
                toast({
                    title: "Profile Photo Updated",
                    description: "Your profile photo has been updated.",
                });
            }
        }
        catch (error) {
            console.error("Error updating profile photo:", error);
            toast({
                title: "Error",
                description: "Failed to save profile photo. It will be used for this gift only.",
                variant: "destructive",
            });
        }
    };
    // Auto-authenticate if contributor is already logged in
    useEffect(() => {
        if (authContributor && contributorToken) {
            // Pre-fill form with contributor data
            setGiftGiverName(authContributor.name);
            setGiftGiverEmail(authContributor.email || '');
            setProfileImageUrl(authContributor.profileImageUrl || '');
        }
    }, [authContributor, contributorToken, authLoading]);
    const sendGiftMutation = useMutation({
        mutationFn: async (giftData) => {
            const response = await apiRequest("POST", "/api/gifts", giftData);
            return response.json();
        },
        onSuccess: () => {
            // Invalidate relevant caches
            queryClient.invalidateQueries({ queryKey: ["/api/children"] });
            queryClient.invalidateQueries({ queryKey: ["/api/portfolio", typedChild.id] });
            queryClient.invalidateQueries({ queryKey: ["/api/gifts", typedChild.id] });
            setGiftSent(true);
            toast({
                title: "Gift Sent Successfully!",
                description: "Your investment gift has been sent to the child's portfolio.",
            });
            setLocation("/");
        },
        onError: () => {
            // Clear payment state on error
            setPaymentId(null);
            toast({
                title: "Error Sending Gift",
                description: "Please try again later.",
                variant: "destructive",
            });
        },
    });
    const handlePaymentSuccess = (paymentId) => {
        setPaymentId(paymentId);
        // Validate amount
        const amountNum = Number(amount);
        if (amountNum <= 0) {
            toast({
                title: "Invalid Amount",
                description: "Please enter a valid amount greater than $0.",
                variant: "destructive",
            });
            return;
        }
        // Proceed with gift creation after successful payment
        const giftData = {
            childId: typedChild.id,
            giftGiverName,
            giftGiverEmail,
            contributorId: authContributor?.id || null, // Include contributor ID if authenticated
            giftGiverProfileImageUrl: profileImageUrl || authContributor?.profileImageUrl || null, // Use current profile image
            investmentId: selectedInvestment.id,
            amount: amountNum.toString(),
            message,
            videoMessageUrl: videoUrl || undefined,
            paymentId,
        };
        sendGiftMutation.mutate(giftData);
    };
    const handlePaymentError = (error) => {
        toast({
            title: "Payment Failed",
            description: error,
            variant: "destructive",
        });
    };
    // Handle mode switching
    const handleModeChange = (newMode) => {
        setGiftMode(newMode);
        // Reset selection when switching modes
        setSelectedInvestment(null);
        setAmount("150");
        setShares("");
    };
    // Bidirectional amount/shares handlers - MUST BE BEFORE CONDITIONAL RETURNS
    const handleAmountChange = (newAmount) => {
        setAmount(newAmount);
        if (selectedInvestment && newAmount) {
            const calculatedShares = (parseFloat(newAmount) / parseFloat(selectedInvestment.currentPrice)).toFixed(4);
            setShares(calculatedShares);
        }
        else {
            setShares("");
        }
    };
    const handleSharesChange = (newShares) => {
        setShares(newShares);
        if (selectedInvestment && newShares) {
            const calculatedAmount = (parseFloat(newShares) * parseFloat(selectedInvestment.currentPrice)).toFixed(2);
            setAmount(calculatedAmount);
        }
        else {
            setAmount("");
        }
    };
    // Initialize shares when investment is selected (only runs when investment changes)
    useEffect(() => {
        if (selectedInvestment && amount && !shares) {
            const calculatedShares = (parseFloat(amount) / parseFloat(selectedInvestment.currentPrice)).toFixed(4);
            setShares(calculatedShares);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedInvestment]);
    const handleSendGift = () => {
        if (!typedChild || !selectedInvestment || !giftGiverName) {
            toast({
                title: "Missing Information",
                description: "Please fill in all required fields.",
                variant: "destructive",
            });
            return;
        }
        // For transfer mode, validate shares
        if (giftMode === "transfer") {
            if (!shares || parseFloat(shares) <= 0) {
                toast({
                    title: "Invalid Shares",
                    description: "Please enter a valid number of shares to transfer.",
                    variant: "destructive",
                });
                return;
            }
            // Skip payment for transfers and send gift directly
            const transferAmount = (parseFloat(shares) * parseFloat(selectedInvestment.currentPrice)).toFixed(2);
            const giftData = {
                childId: typedChild.id,
                giftGiverName,
                giftGiverEmail,
                contributorId: authContributor?.id || null,
                giftGiverProfileImageUrl: profileImageUrl || authContributor?.profileImageUrl || null,
                investmentId: selectedInvestment.id,
                amount: transferAmount,
                shares: shares,
                message,
                videoMessageUrl: videoUrl || undefined,
                transferMode: true, // Flag for backend to handle as transfer
                paymentId: `transfer-${Date.now()}`, // Generate transfer ID
            };
            sendGiftMutation.mutate(giftData);
            return;
        }
        // For buy mode, validate amount
        const amountNum = Number(amount);
        if (amountNum <= 0) {
            toast({
                title: "Invalid Amount",
                description: "Please enter a valid amount greater than $0.",
                variant: "destructive",
            });
            return;
        }
        // For buy mode, payment is handled by the payment form
        // Just show a message to complete payment
        if (!paymentId) {
            toast({
                title: "Complete Payment",
                description: "Please complete the payment below to send your gift.",
            });
        }
    };
    if (isLoading || authLoading) {
        return (_jsx("div", { className: "min-h-screen bg-background flex items-center justify-center", children: _jsx("div", { className: "animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" }) }));
    }
    if (!typedChild) {
        return (_jsx("div", { className: "min-h-screen bg-background flex items-center justify-center", children: _jsx(Card, { className: "w-full max-w-md mx-4", children: _jsxs(CardContent, { className: "pt-6 text-center", children: [_jsx("h1", { className: "text-2xl font-bold text-destructive mb-4", children: "Invalid Gift Link" }), _jsx("p", { className: "text-muted-foreground", children: "This gift link is not valid or has expired." })] }) }) }));
    }
    const estimatedShares = shares || "0";
    return (_jsxs("div", { className: "min-h-screen bg-background", children: [_jsx(GiftGiverAuthModal, { isOpen: shouldShowAuthModal, onClose: () => { }, onAuthenticated: handleAuthenticated, childName: childFullName }), _jsx("div", { className: "bg-gradient-to-r from-primary to-accent text-white p-4 sm:p-6 lg:p-8", children: _jsx("div", { className: "max-w-4xl mx-auto", children: _jsxs("div", { className: "flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4", children: [_jsxs("div", { className: "min-w-0 flex-1", children: [_jsx("h1", { className: "text-2xl sm:text-3xl font-bold", children: "StockSprout" }), _jsxs("p", { className: "text-white/90 text-sm sm:text-base", children: ["Send an investment gift to ", childFullName] })] }), authContributor && (_jsx(Button, { variant: "outline", size: "sm", onClick: () => setLocation("/"), className: "bg-white/10 border-white/20 text-white hover:bg-white/20", children: "Go to Dashboard" }))] }) }) }), _jsxs("div", { className: "max-w-4xl mx-auto p-4 sm:p-6 space-y-6 sm:space-y-8", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center space-x-2", children: [_jsx(CheckCircle, { className: "w-6 h-6 text-success" }), _jsx("span", { children: "Confirm Gift Recipient" })] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "flex flex-col sm:flex-row items-center gap-4 sm:gap-6 bg-muted rounded-xl p-4 sm:p-6", children: [_jsx("div", { className: "w-20 h-20 sm:w-24 sm:h-24 bg-primary rounded-full flex items-center justify-center text-white text-xl sm:text-2xl font-bold", children: childFullName.charAt(0) }), _jsxs("div", { className: "flex-1 text-center sm:text-left", children: [_jsx("h3", { className: "text-xl sm:text-2xl font-bold text-foreground", children: childFullName }), _jsxs("p", { className: "text-muted-foreground text-base sm:text-lg", children: [typedChild.age, " years old", typedChild.birthday && ` • Birthday: ${typedChild.birthday}`] })] }), _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "w-10 h-10 sm:w-12 sm:h-12 bg-success rounded-full flex items-center justify-center mb-2", children: _jsx(CheckCircle, { className: "w-5 h-5 sm:w-6 sm:h-6 text-success-foreground" }) }), _jsx("p", { className: "text-success font-semibold text-sm sm:text-base", children: "Verified" })] })] }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Your Information" }) }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { className: "flex flex-col sm:flex-row items-center gap-4 p-4 bg-muted rounded-xl", children: [_jsxs("div", { className: "relative", children: [_jsx(Avatar, { className: "w-16 h-16", children: profileImageUrl ? (_jsx("img", { src: profileImageUrl, alt: "Profile", className: "w-full h-full object-cover" })) : (_jsx(AvatarFallback, { className: "text-lg", children: giftGiverName.split(' ').map(n => n[0]).join('').toUpperCase() || 'U' })) }), _jsx(Button, { size: "sm", className: "absolute -bottom-1 -right-1 rounded-full w-6 h-6 p-0", variant: "secondary", onClick: () => fileInputRef.current?.click(), children: _jsx(Camera, { className: "w-3 h-3" }) }), _jsx("input", { ref: fileInputRef, type: "file", accept: "image/*", onChange: handleGallerySelect, className: "hidden" })] }), _jsxs("div", { className: "flex-1 text-center sm:text-left", children: [_jsx("h3", { className: "font-semibold text-foreground", children: "Profile Photo" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Add a photo to personalize your gift" })] })] }), _jsx(TakePhotoModal, { isOpen: isCameraOpen, onClose: () => setIsCameraOpen(false), onPhotoTaken: handlePhotoTaken, title: "Add Profile Photo" }), _jsx(PhotoEditorModal, { isOpen: isPhotoEditorOpen, onClose: () => {
                                            setIsPhotoEditorOpen(false);
                                            setTempImageUrl("");
                                        }, imageUrl: tempImageUrl, onSave: handlePhotoEdited, title: "Edit Profile Photo" }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-semibold text-foreground mb-2", children: "Your Name *" }), _jsx(Input, { value: giftGiverName, onChange: (e) => setGiftGiverName(e.target.value), placeholder: "Enter your name", "data-testid": "input-giver-name" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-semibold text-foreground mb-2", children: "Your Email (Optional)" }), _jsx(Input, { type: "email", value: giftGiverEmail, onChange: (e) => setGiftGiverEmail(e.target.value), placeholder: "Enter your email", "data-testid": "input-giver-email" })] })] })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { className: "flex items-center justify-between", children: _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(DollarSign, { className: "w-6 h-6" }), _jsx("span", { children: "Choose an Investment" })] }) }) }), _jsxs(CardContent, { className: "space-y-6", children: [_jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-muted rounded-lg", children: [_jsxs("div", { className: "flex-1", children: [_jsx("h4", { className: "font-semibold text-foreground mb-1", children: "Gift Method" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Choose how you want to gift shares" })] }), _jsxs("div", { className: "flex flex-col sm:flex-row gap-2 w-full sm:w-auto", children: [_jsxs(Button, { variant: giftMode === "buy" ? "default" : "outline", onClick: () => handleModeChange("buy"), className: "flex items-center justify-center gap-2 w-full sm:w-auto", "data-testid": "button-mode-buy", children: [_jsx(ShoppingCart, { className: "w-4 h-4" }), "Buy Shares"] }), _jsxs(Button, { variant: giftMode === "transfer" ? "default" : "outline", onClick: () => handleModeChange("transfer"), className: "flex items-center justify-center gap-2 w-full sm:w-auto", "data-testid": "button-mode-transfer", children: [_jsx(ArrowLeftRight, { className: "w-4 h-4" }), "Transfer from Brokerage"] })] })] }), giftMode === "buy" ? (_jsx(InvestmentSelector, { selectedInvestment: selectedInvestment, onSelectInvestment: setSelectedInvestment })) : (_jsx(BrokerageTransferSelector, { selectedInvestment: selectedInvestment, selectedShares: shares, onSelectInvestment: setSelectedInvestment, onSharesChange: setShares })), selectedInvestment && (_jsxs("div", { className: "p-4 bg-primary/5 border-2 border-primary rounded-lg", children: [_jsxs("div", { className: "flex items-center justify-between mb-3", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden bg-muted", children: _jsx("img", { src: getStockLogoUrl(selectedInvestment.symbol, selectedInvestment.name), alt: `${selectedInvestment.symbol} logo`, className: "w-full h-full object-contain", onError: (e) => {
                                                                        const target = e.currentTarget;
                                                                        if (!target.src.startsWith('data:')) {
                                                                            target.src = getFallbackLogoUrl(selectedInvestment.symbol);
                                                                        }
                                                                    } }) }), _jsxs("div", { children: [_jsx("h4", { className: "font-semibold text-foreground", children: selectedInvestment.name }), _jsx("p", { className: "text-sm text-muted-foreground", children: selectedInvestment.symbol })] })] }), _jsxs("div", { className: "text-right", children: [_jsxs("p", { className: "font-semibold text-foreground", children: ["$", parseFloat(selectedInvestment.currentPrice).toFixed(2)] }), _jsxs("p", { className: `text-sm font-medium ${parseFloat(selectedInvestment.ytdReturn) >= 0
                                                                    ? 'text-green-600'
                                                                    : 'text-red-600'}`, children: [parseFloat(selectedInvestment.ytdReturn) >= 0 ? '+' : '', parseFloat(selectedInvestment.ytdReturn).toFixed(2), "% YTD"] })] })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("div", { className: "w-2 h-2 bg-primary rounded-full" }), _jsx("span", { className: "text-primary text-sm font-medium", children: "Selected" })] })] }))] })] }), giftMode === "buy" && (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Gift Amount" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-8", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-semibold text-foreground mb-2", children: "Dollar Amount" }), _jsxs("div", { className: "relative", children: [_jsx("span", { className: "absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground text-xl", children: "$" }), _jsx(Input, { type: "number", value: amount, onChange: (e) => handleAmountChange(e.target.value), className: "pl-8 text-2xl font-bold h-12", min: "0.01", step: "0.01", "data-testid": "input-gift-amount" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-semibold text-foreground mb-2", children: "Number of Shares" }), _jsx("div", { className: "relative", children: _jsx(Input, { type: "number", value: shares, onChange: (e) => handleSharesChange(e.target.value), className: "text-2xl font-bold h-12", min: "0.0001", step: "0.0001", placeholder: "0.0000", "data-testid": "input-gift-shares" }) }), selectedInvestment && (_jsxs("p", { className: "text-sm text-muted-foreground mt-1", children: ["shares of ", selectedInvestment.name] }))] })] }) })] })), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center space-x-2", children: [_jsx(MessageSquare, { className: "w-6 h-6" }), _jsx("span", { children: "Personal Message" })] }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "mb-6 p-4 bg-primary/5 border-l-4 border-primary rounded-r-lg", children: _jsxs("p", { className: "text-sm text-foreground leading-relaxed", children: [_jsx("strong", { className: "text-primary", children: "\uD83D\uDCA1 Make it Meaningful:" }), " Every contribution is a chance to plant wisdom alongside wealth. Consider adding a video or written message that sparks curiosity, excitement, and long-term thinking. Whether it's a quote about patience, a story about your first investment, a lesson you learned along your financial journey, or a reminder that money can be a tool for freedom, your words will help shape how this child sees their financial future. Let your message be a compass they carry for years to come."] }) }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-8", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-semibold text-foreground mb-2", children: "Video Message" }), _jsx(VideoRecorder, { onVideoRecorded: setVideoUrl, videoUrl: videoUrl })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-semibold text-foreground mb-2", children: "Written Message" }), _jsx(Textarea, { value: message, onChange: (e) => setMessage(e.target.value), placeholder: `Write a personal message for ${childFullName}...`, rows: 8, className: "resize-none", "data-testid": "textarea-message" })] })] })] })] }), giftMode === "buy" && !giftSent && selectedInvestment && giftGiverName && (_jsx(RecurringContributionSetup, { childId: typedChild.id, childName: childFullName, selectedInvestment: selectedInvestment, amount: amount, contributorName: giftGiverName, contributorEmail: giftGiverEmail })), giftMode === "buy" && (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center space-x-2", children: [_jsx(CreditCard, { className: "w-6 h-6" }), _jsx("span", { children: "Payment" })] }) }), _jsx(CardContent, { children: _jsx(MockPaymentForm, { amount: parseFloat(amount), giftGiverName: giftGiverName, investmentName: selectedInvestment?.name || "", shares: shares, childName: childFullName, onPaymentSuccess: handlePaymentSuccess, onPaymentError: handlePaymentError, disabled: sendGiftMutation.isPending }) })] })), giftMode === "transfer" && (_jsx(Card, { className: "bg-muted", children: _jsx(CardContent, { className: "p-8", children: _jsxs("div", { className: "flex flex-col space-y-6", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-xl font-bold text-foreground", children: "Gift Summary" }), _jsxs("p", { className: "text-muted-foreground", children: ["Transfer ", shares || "0", " shares of", " ", selectedInvestment?.name || "Select an investment"] }), _jsxs("p", { className: "text-muted-foreground", children: ["Estimated value: $", shares && selectedInvestment
                                                        ? (parseFloat(shares) * parseFloat(selectedInvestment.currentPrice)).toFixed(2)
                                                        : "0.00"] }), _jsxs("p", { className: "text-muted-foreground", children: ["To: ", childFullName] }), paymentId && (_jsxs("p", { className: "text-success text-sm mt-2", children: ["\u2713 Transfer ready: ", paymentId] }))] }), _jsxs(Button, { onClick: handleSendGift, disabled: !selectedInvestment || !giftGiverName || sendGiftMutation.isPending || giftSent, className: `w-full px-8 py-4 h-auto text-lg font-bold ${giftSent
                                            ? "bg-success text-success-foreground"
                                            : "bg-gradient-to-r from-primary to-accent text-white"}`, "data-testid": "button-send-gift", children: [_jsx(Gift, { className: "w-5 h-5 mr-2" }), sendGiftMutation.isPending
                                                ? "Transferring..."
                                                : giftSent
                                                    ? "Gift Sent Successfully!"
                                                    : "Transfer Shares"] })] }) }) }))] })] }));
}
