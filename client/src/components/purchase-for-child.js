import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import InvestmentSelector from '@/components/investment-selector';
import MockPaymentForm from '@/components/mock-payment-form';
import VideoRecorder from '@/components/video-recorder';
import { DollarSign, ShoppingCart, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { queryClient } from '@/lib/queryClient';
export function PurchaseForChild({ childId, childName }) {
    const { user, token } = useAuth();
    const { toast } = useToast();
    const [isOpen, setIsOpen] = useState(false);
    const [selectedInvestment, setSelectedInvestment] = useState(null);
    const [amount, setAmount] = useState('100');
    const [shares, setShares] = useState('');
    const [message, setMessage] = useState('');
    const [videoUrl, setVideoUrl] = useState('');
    const [showPayment, setShowPayment] = useState(false);
    const [paymentId, setPaymentId] = useState(null);
    const purchaseMutation = useMutation({
        mutationFn: async (data) => {
            const response = await fetch('/api/gifts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(data),
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Purchase failed');
            }
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['/api/portfolio', childId] });
            queryClient.invalidateQueries({ queryKey: ['/api/gifts', childId] });
            toast({
                title: 'Purchase Successful!',
                description: `Successfully purchased ${selectedInvestment?.symbol} for ${childName}`,
            });
            // Reset form
            setSelectedInvestment(null);
            setAmount('100');
            setMessage('');
            setVideoUrl('');
            setPaymentId(null);
            setShowPayment(false);
            setIsOpen(false);
        },
        onError: (error) => {
            toast({
                title: 'Purchase Failed',
                description: error.message,
                variant: 'destructive',
            });
            setPaymentId(null);
            setShowPayment(false);
        },
    });
    const handlePaymentSuccess = (newPaymentId) => {
        setPaymentId(newPaymentId);
        setShowPayment(false);
        // Validate amount
        const amountNum = Number(amount);
        if (amountNum <= 0) {
            toast({
                title: 'Invalid Amount',
                description: 'Please enter a valid amount greater than $0.',
                variant: 'destructive',
            });
            return;
        }
        // Proceed with purchase
        const purchaseData = {
            childId,
            giftGiverName: user?.name || 'Parent',
            giftGiverEmail: user?.email || undefined,
            contributorId: user?.id || null, // Link to parent as contributor
            giftGiverProfileImageUrl: user?.profileImageUrl || null, // Include parent's profile photo
            investmentId: selectedInvestment.id,
            amount: amountNum.toString(),
            message: message || `Investment purchase by ${user?.name}`,
            videoMessageUrl: videoUrl || undefined,
            paymentId: newPaymentId,
        };
        purchaseMutation.mutate(purchaseData);
    };
    const handlePaymentError = (error) => {
        toast({
            title: 'Payment Failed',
            description: error,
            variant: 'destructive',
        });
        setPaymentId(null);
    };
    const handlePurchase = () => {
        if (!selectedInvestment) {
            toast({
                title: 'No Investment Selected',
                description: 'Please select an investment first.',
                variant: 'destructive',
            });
            return;
        }
        const amountNum = Number(amount);
        if (amountNum <= 0) {
            toast({
                title: 'Invalid Amount',
                description: 'Please enter a valid amount greater than $0.',
                variant: 'destructive',
            });
            return;
        }
        if (!paymentId) {
            setShowPayment(true);
        }
    };
    // Bidirectional amount/shares handlers
    const handleAmountChange = (newAmount) => {
        setAmount(newAmount);
        if (selectedInvestment && newAmount) {
            const calculatedShares = (parseFloat(newAmount) / parseFloat(selectedInvestment.currentPrice)).toFixed(4);
            setShares(calculatedShares);
        }
        else {
            setShares('');
        }
    };
    const handleSharesChange = (newShares) => {
        setShares(newShares);
        if (selectedInvestment && newShares) {
            const calculatedAmount = (parseFloat(newShares) * parseFloat(selectedInvestment.currentPrice)).toFixed(2);
            setAmount(calculatedAmount);
        }
        else {
            setAmount('');
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
    const estimatedShares = shares || '0';
    return (_jsxs(Dialog, { open: isOpen, onOpenChange: setIsOpen, children: [_jsx(DialogTrigger, { asChild: true, children: _jsxs(Button, { className: "w-full", children: [_jsx(ShoppingCart, { className: "w-4 h-4 mr-2" }), "Purchase Investment"] }) }), _jsxs(DialogContent, { className: "max-w-4xl max-h-[90vh] overflow-y-auto", children: [_jsx(DialogHeader, { children: _jsxs(DialogTitle, { children: ["Purchase Investment for ", childName] }) }), _jsxs("div", { className: "space-y-6 py-4", children: [_jsx(Card, { children: _jsx(CardContent, { className: "pt-6", children: _jsx(InvestmentSelector, { selectedInvestment: selectedInvestment, onSelectInvestment: setSelectedInvestment }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "pt-6", children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-semibold mb-2", children: "Purchase Amount" }), _jsxs("div", { className: "relative", children: [_jsx("span", { className: "absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground text-xl", children: "$" }), _jsx(Input, { type: "number", value: amount, onChange: (e) => handleAmountChange(e.target.value), className: "pl-8 text-2xl font-bold h-12", min: "0.01", step: "0.01" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-semibold mb-2", children: "Number of Shares" }), _jsx(Input, { type: "number", value: shares, onChange: (e) => handleSharesChange(e.target.value), className: "text-2xl font-bold h-12", min: "0.0001", step: "0.0001", placeholder: "0.0000" }), selectedInvestment && (_jsxs("p", { className: "text-sm text-muted-foreground mt-1", children: ["shares of ", selectedInvestment.name] }))] })] }) }) }), _jsx(Card, { children: _jsxs(CardContent, { className: "pt-6", children: [_jsx("label", { className: "block text-sm font-semibold mb-2", children: "Personal Message (Optional)" }), _jsx(Textarea, { value: message, onChange: (e) => setMessage(e.target.value), placeholder: `Add a personal message for ${childName}...`, className: "min-h-[80px]", maxLength: 500 }), _jsxs("p", { className: "text-xs text-muted-foreground mt-1", children: [message.length, "/500 characters"] })] }) }), _jsx(Card, { children: _jsxs(CardContent, { className: "pt-6", children: [_jsx("label", { className: "block text-sm font-semibold mb-3", children: "Video Message (Optional)" }), videoUrl ? (_jsxs("div", { className: "space-y-3", children: [_jsx("video", { src: videoUrl, controls: true, playsInline: true, className: "w-full h-48 bg-black rounded-lg" }), _jsxs(Button, { size: "sm", variant: "outline", onClick: () => setVideoUrl(''), className: "w-full", children: [_jsx(X, { className: "w-4 h-4 mr-2" }), "Remove Video"] })] })) : (_jsx(VideoRecorder, { onVideoRecorded: setVideoUrl }))] }) }), showPayment && (_jsx(Card, { children: _jsx(CardContent, { className: "pt-6", children: _jsx(MockPaymentForm, { amount: parseFloat(amount), giftGiverName: user?.name || 'Parent', investmentName: selectedInvestment?.name || '', shares: shares, childName: childName, onPaymentSuccess: handlePaymentSuccess, onPaymentError: handlePaymentError, disabled: purchaseMutation.isPending }) }) })), !showPayment && (_jsx(Card, { className: "bg-muted", children: _jsx(CardContent, { className: "pt-6", children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-lg font-bold mb-2", children: "Purchase Summary" }), _jsxs("div", { className: "space-y-1 text-sm", children: [_jsxs("p", { children: [_jsx("span", { className: "font-semibold", children: "Amount:" }), " $", amount, " \u2192 ", estimatedShares, " shares"] }), _jsxs("p", { children: [_jsx("span", { className: "font-semibold", children: "Investment:" }), " ", selectedInvestment?.name || 'Select an investment'] }), _jsxs("p", { children: [_jsx("span", { className: "font-semibold", children: "For:" }), " ", childName] }), message && (_jsxs("p", { children: [_jsx("span", { className: "font-semibold", children: "Message:" }), " ", message.substring(0, 50), message.length > 50 ? '...' : ''] })), videoUrl && (_jsx("p", { className: "text-success", children: "\u2713 Video message attached" }))] })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { variant: "outline", onClick: () => setIsOpen(false), className: "flex-1", children: "Cancel" }), _jsxs(Button, { onClick: handlePurchase, disabled: !selectedInvestment || purchaseMutation.isPending, className: "flex-1", children: [_jsx(DollarSign, { className: "w-5 h-5 mr-2" }), "Continue to Payment"] })] })] }) }) }))] })] })] }));
}
