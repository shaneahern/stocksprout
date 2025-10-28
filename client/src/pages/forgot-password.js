import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Mail } from 'lucide-react';
export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState('');
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            // TODO: Replace with actual API call
            const response = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });
            if (!response.ok) {
                throw new Error('Failed to send reset email');
            }
            setIsSubmitted(true);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong');
        }
        finally {
            setIsLoading(false);
        }
    };
    if (isSubmitted) {
        return (_jsxs("div", { className: "min-h-screen bg-white", children: [_jsxs("div", { className: "bg-gray-800 text-white text-sm px-4 py-1 flex justify-between items-center", children: [_jsx("span", { className: "text-sm", children: "9:41" }), _jsxs("div", { className: "flex items-center space-x-1", children: [_jsx("div", { className: "w-1 h-1 bg-gray-400 rounded-full" }), _jsx("div", { className: "w-1 h-1 bg-gray-400 rounded-full" }), _jsx("div", { className: "w-1 h-1 bg-gray-400 rounded-full" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsxs("div", { className: "flex space-x-1", children: [_jsx("div", { className: "w-1 h-1 bg-white rounded-full" }), _jsx("div", { className: "w-1 h-1 bg-white rounded-full" }), _jsx("div", { className: "w-1 h-1 bg-white rounded-full" }), _jsx("div", { className: "w-1 h-1 bg-white rounded-full" })] }), _jsx("div", { className: "w-4 h-2 border border-white rounded-sm", children: _jsx("div", { className: "w-3 h-1 bg-white rounded-sm" }) })] })] }), _jsx("div", { className: "flex flex-col items-center justify-center min-h-[calc(100vh-60px)] px-4 py-8", children: _jsxs(Card, { className: "w-full max-w-md mx-auto shadow-lg border-0 rounded-2xl", children: [_jsx(CardHeader, { className: "pb-4", children: _jsx(CardTitle, { className: "text-2xl text-center text-gray-800 font-semibold", children: "Check Your Email" }) }), _jsx(CardContent, { className: "px-6 pb-6", children: _jsxs("div", { className: "text-center space-y-4", children: [_jsx("div", { className: "w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto", children: _jsx(Mail, { className: "w-8 h-8 text-green-600" }) }), _jsxs("div", { className: "space-y-2", children: [_jsx("p", { className: "text-gray-700", children: "We've sent a password reset link to:" }), _jsx("p", { className: "font-medium text-gray-900", children: email })] }), _jsxs("div", { className: "space-y-3 pt-4", children: [_jsx("p", { className: "text-sm text-gray-600", children: "Please check your email and click the link to reset your password. If you don't see the email, check your spam folder." }), _jsxs("div", { className: "flex flex-col space-y-2", children: [_jsx(Button, { onClick: () => setIsSubmitted(false), variant: "outline", className: "w-full", children: "Send Another Email" }), _jsx(Link, { href: "/auth", children: _jsxs(Button, { variant: "ghost", className: "w-full", children: [_jsx(ArrowLeft, { className: "w-4 h-4 mr-2" }), "Back to Login"] }) })] })] })] }) })] }) })] }));
    }
    return (_jsxs("div", { className: "min-h-screen bg-white", children: [_jsxs("div", { className: "bg-gray-800 text-white text-sm px-4 py-1 flex justify-between items-center", children: [_jsx("span", { className: "text-sm", children: "9:41" }), _jsxs("div", { className: "flex items-center space-x-1", children: [_jsx("div", { className: "w-1 h-1 bg-gray-400 rounded-full" }), _jsx("div", { className: "w-1 h-1 bg-gray-400 rounded-full" }), _jsx("div", { className: "w-1 h-1 bg-gray-400 rounded-full" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsxs("div", { className: "flex space-x-1", children: [_jsx("div", { className: "w-1 h-1 bg-white rounded-full" }), _jsx("div", { className: "w-1 h-1 bg-white rounded-full" }), _jsx("div", { className: "w-1 h-1 bg-white rounded-full" }), _jsx("div", { className: "w-1 h-1 bg-white rounded-full" })] }), _jsx("div", { className: "w-4 h-2 border border-white rounded-sm", children: _jsx("div", { className: "w-3 h-1 bg-white rounded-sm" }) })] })] }), _jsxs("div", { className: "flex flex-col items-center justify-center min-h-[calc(100vh-60px)] px-4 py-8", children: [_jsxs("div", { className: "text-center mb-8", children: [_jsx("div", { className: "flex items-center justify-center mb-4", children: _jsx("img", { src: "/stocksprout-logo.png", alt: "StockSprout Logo", className: "h-24 w-auto" }) }), _jsx("p", { className: "text-sm text-gray-600", children: "Growing the future our kids deserve" })] }), _jsxs(Card, { className: "w-full max-w-md mx-auto shadow-lg border-0 rounded-2xl", children: [_jsx(CardHeader, { className: "pb-4", children: _jsx(CardTitle, { className: "text-2xl text-center text-gray-800 font-semibold", children: "Forgot Password" }) }), _jsx(CardContent, { className: "px-6 pb-6", children: _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [error && (_jsx(Alert, { variant: "destructive", className: "mb-4", children: _jsx(AlertDescription, { children: error }) })), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "email", className: "text-gray-700 font-medium", children: "Email Address" }), _jsx(Input, { id: "email", name: "email", type: "email", value: email, onChange: (e) => setEmail(e.target.value), required: true, placeholder: "Enter your email address", className: "bg-gray-50 border-gray-200 rounded-lg h-11" })] }), _jsx(Button, { type: "submit", className: "w-full bg-blue-600 hover:bg-blue-700 rounded-lg h-11 font-medium", disabled: isLoading, children: isLoading ? 'Sending...' : 'Send Reset Link' }), _jsx("div", { className: "text-center pt-4", children: _jsx(Link, { href: "/auth", children: _jsxs(Button, { type: "button", variant: "link", className: "p-0 h-auto text-blue-600 font-medium", children: [_jsx(ArrowLeft, { className: "w-4 h-4 mr-1" }), "Back to Login"] }) }) })] }) })] }), _jsxs("div", { className: "mt-12 text-center text-xs text-gray-600 space-y-1", children: [_jsx("p", { children: "StockSprout LLC, Member NYSE, SIPC, FCC." }), _jsx("p", { children: "700 Sprout Street, Phoenix, AZ 85235" }), _jsx("p", { children: "\u00A92025, All rights reserved." }), _jsx(Link, { href: "/privacy-policy", children: _jsx("p", { className: "text-blue-600 cursor-pointer hover:text-blue-800", children: "Privacy Policy" }) })] })] })] }));
}
