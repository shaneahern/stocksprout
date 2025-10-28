import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard, Lock, AlertCircle, CheckCircle } from "lucide-react";
import { processMockPayment } from "@/lib/mock-stripe";
export default function MockPaymentForm({ amount, giftGiverName, investmentName, shares, childName, onPaymentSuccess, onPaymentError, disabled = false }) {
    const [cardNumber, setCardNumber] = useState("4242 4242 4242 4242");
    const [expiry, setExpiry] = useState("12/28");
    const [cvc, setCvc] = useState("123");
    const [name, setName] = useState("John Doe");
    const [isProcessing, setIsProcessing] = useState(false);
    const formatCardNumber = (value) => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        const matches = v.match(/\d{4,16}/g);
        const match = matches && matches[0] || '';
        const parts = [];
        for (let i = 0, len = match.length; i < len; i += 4) {
            parts.push(match.substring(i, i + 4));
        }
        if (parts.length) {
            return parts.join(' ');
        }
        else {
            return v;
        }
    };
    const formatExpiry = (value) => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        if (v.length >= 2) {
            return v.substring(0, 2) + '/' + v.substring(2, 4);
        }
        return v;
    };
    const handleCardNumberChange = (e) => {
        const formatted = formatCardNumber(e.target.value);
        if (formatted.length <= 19) {
            setCardNumber(formatted);
        }
    };
    const handleExpiryChange = (e) => {
        const formatted = formatExpiry(e.target.value);
        if (formatted.length <= 5) {
            setExpiry(formatted);
        }
    };
    const handlePayment = async () => {
        if (!cardNumber || !expiry || !cvc || !name) {
            onPaymentError("Please fill in all payment details");
            return;
        }
        setIsProcessing(true);
        try {
            const result = await processMockPayment(amount, giftGiverName);
            if (result.success && result.paymentId) {
                onPaymentSuccess(result.paymentId);
            }
            else {
                onPaymentError(result.error || "Payment failed");
            }
        }
        catch (error) {
            onPaymentError("Network error - please try again");
        }
        finally {
            setIsProcessing(false);
        }
    };
    return (_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center space-x-2", children: [_jsx(CreditCard, { className: "w-6 h-6" }), _jsx("span", { children: "Payment Information" })] }), _jsxs("div", { className: "bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start space-x-2", children: [_jsx(AlertCircle, { className: "w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" }), _jsxs("div", { className: "text-sm text-blue-800", children: [_jsx("p", { className: "font-semibold mb-1", children: "Demo Mode - Mock Payment" }), _jsx("p", { children: "This is a simulated payment. No real charges will be made. Use the pre-filled test card details." })] })] })] }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-1 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "cardName", children: "Cardholder Name" }), _jsx(Input, { id: "cardName", value: name, onChange: (e) => setName(e.target.value), placeholder: "John Doe", disabled: disabled || isProcessing, "data-testid": "input-card-name" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "cardNumber", children: "Card Number" }), _jsx(Input, { id: "cardNumber", value: cardNumber, onChange: handleCardNumberChange, placeholder: "1234 5678 9012 3456", disabled: disabled || isProcessing, "data-testid": "input-card-number" })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "expiry", children: "Expiry Date" }), _jsx(Input, { id: "expiry", value: expiry, onChange: handleExpiryChange, placeholder: "MM/YY", disabled: disabled || isProcessing, "data-testid": "input-card-expiry" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "cvc", children: "CVC" }), _jsx(Input, { id: "cvc", value: cvc, onChange: (e) => setCvc(e.target.value.replace(/[^0-9]/g, '').substring(0, 4)), placeholder: "123", disabled: disabled || isProcessing, "data-testid": "input-card-cvc" })] })] })] }), _jsxs("div", { className: "border-t pt-4", children: [_jsxs("div", { className: "mb-4", children: [_jsx("h3", { className: "text-lg font-bold text-foreground mb-2", children: "Gift Summary" }), _jsxs("p", { className: "text-muted-foreground", children: ["$", amount.toFixed(2), " \u2192 ", shares, " ", parseFloat(shares) === 1 ? 'share' : 'shares', " of ", investmentName] }), _jsxs("p", { className: "text-muted-foreground", children: ["To: ", childName] })] }), _jsxs("div", { className: "flex justify-between items-center mb-4", children: [_jsx("span", { className: "text-sm text-muted-foreground", children: "Amount to charge:" }), _jsxs("span", { className: "text-xl font-bold", children: ["$", amount.toFixed(2)] })] }), _jsx(Button, { onClick: handlePayment, disabled: disabled || isProcessing, className: "w-full bg-success text-success-foreground", "data-testid": "button-process-payment", children: isProcessing ? (_jsxs(_Fragment, { children: [_jsx("div", { className: "animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" }), "Processing..."] })) : (_jsxs(_Fragment, { children: [_jsx(CheckCircle, { className: "w-4 h-4 mr-2" }), "Pay $", amount.toFixed(2)] })) })] }), _jsxs("div", { className: "text-xs text-muted-foreground text-center pt-2 border-t", children: [_jsx(Lock, { className: "w-3 h-3 inline mr-1" }), "Secured by Mock Stripe - This is a demo payment system"] })] })] }));
}
