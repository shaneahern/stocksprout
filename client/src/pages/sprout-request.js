import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Gift, UserPlus, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { calculateAge } from '@/lib/utils';
export default function SproutRequestPage() {
    const { requestCode } = useParams();
    const [, setLocation] = useLocation();
    const { toast } = useToast();
    const [showSignup, setShowSignup] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [signupData, setSignupData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
    });
    const { data: requestData, isLoading } = useQuery({
        queryKey: ['/api/sprout-requests/code', requestCode],
        queryFn: async () => {
            const response = await fetch(`/api/sprout-requests/code/${requestCode}`);
            if (!response.ok) {
                throw new Error('Sprout request not found');
            }
            return response.json();
        },
        enabled: !!requestCode,
    });
    const signupMutation = useMutation({
        mutationFn: async (data) => {
            const response = await fetch('/api/contributors/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Signup failed');
            }
            return response.json();
        },
        onSuccess: (data) => {
            toast({
                title: 'Welcome!',
                description: 'Your account has been created. Redirecting to gift page...',
            });
            // Store token and redirect to gift giving page
            localStorage.setItem('token', data.token);
            // Reload the page to trigger AuthContext to pick up the new token
            window.location.href = `/gift/${requestData?.child?.giftLinkCode}`;
        },
        onError: (error) => {
            toast({
                title: 'Error',
                description: error.message,
                variant: 'destructive',
            });
        },
    });
    const handleSignupSubmit = (e) => {
        e.preventDefault();
        if (signupData.password !== signupData.confirmPassword) {
            toast({
                title: 'Error',
                description: 'Passwords do not match',
                variant: 'destructive',
            });
            return;
        }
        if (signupData.password.length < 6) {
            toast({
                title: 'Error',
                description: 'Password must be at least 6 characters',
                variant: 'destructive',
            });
            return;
        }
        signupMutation.mutate({
            name: signupData.name || requestData?.contributorName,
            email: signupData.email,
            password: signupData.password,
            phone: signupData.phone || requestData?.contributorPhone,
            sproutRequestCode: requestCode,
        });
    };
    const handleContinueWithoutSignup = () => {
        if (requestData?.child?.giftLinkCode) {
            setLocation(`/gift/${requestData.child.giftLinkCode}`);
        }
    };
    if (isLoading) {
        return (_jsx("div", { className: "min-h-screen flex items-center justify-center bg-gray-50", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" }), _jsx("p", { className: "mt-2 text-muted-foreground", children: "Loading..." })] }) }));
    }
    if (!requestData) {
        return (_jsx("div", { className: "min-h-screen flex items-center justify-center bg-gray-50 p-4", children: _jsx(Card, { className: "max-w-md w-full", children: _jsxs(CardContent, { className: "pt-6 text-center", children: [_jsx("p", { className: "text-muted-foreground mb-4", children: "Sprout request not found or expired" }), _jsx(Button, { onClick: () => setLocation('/'), children: "Go Home" })] }) }) }));
    }
    const child = requestData.child;
    const childName = child?.firstName && child?.lastName
        ? `${child.firstName} ${child.lastName}`
        : child?.name || 'Child';
    const childAge = child?.birthdate ? calculateAge(child.birthdate) : child?.age || 0;
    return (_jsx("div", { className: "min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8", children: _jsxs("div", { className: "max-w-md mx-auto space-y-8", children: [_jsxs("div", { className: "text-center", children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "StockSprout" }), _jsx("p", { className: "mt-2 text-sm text-gray-600", children: "Contribution Request" })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-3", children: [_jsx(Gift, { className: "w-6 h-6 text-primary" }), _jsx("span", { children: "You've Been Invited!" })] }) }), _jsxs(CardContent, { children: [_jsxs("div", { className: "text-center mb-4", children: [_jsx(Avatar, { className: "w-16 h-16 mx-auto mb-3", children: child?.profileImageUrl ? (_jsx("img", { src: child.profileImageUrl, alt: childName })) : (_jsx(AvatarFallback, { className: "text-lg", children: child?.firstName?.charAt(0)?.toUpperCase() || child?.name?.charAt(0)?.toUpperCase() || 'C' })) }), _jsx("h3", { className: "text-xl font-bold", children: childName }), _jsxs("p", { className: "text-sm text-muted-foreground", children: ["Age ", childAge] })] }), requestData.message && (_jsx(Alert, { className: "mb-4", children: _jsx(AlertDescription, { children: requestData.message }) })), _jsxs("p", { className: "text-sm text-muted-foreground text-center", children: ["You've been invited to contribute to ", childName, "'s investment account. Help them build their financial future!"] })] })] }), !showSignup ? (_jsx(Card, { children: _jsxs(CardContent, { className: "pt-6 space-y-3", children: [_jsxs(Button, { onClick: () => setShowSignup(true), className: "w-full", size: "lg", children: [_jsx(UserPlus, { className: "w-5 h-5 mr-2" }), "Create Account & Contribute"] }), _jsx(Button, { onClick: handleContinueWithoutSignup, variant: "outline", className: "w-full", size: "lg", children: "Continue as Guest" }), _jsx("p", { className: "text-xs text-center text-muted-foreground", children: "Create an account to track your contributions and receive updates" })] }) })) : (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Create Your Account" }) }), _jsx(CardContent, { children: _jsxs("form", { onSubmit: handleSignupSubmit, className: "space-y-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "signup-name", children: "Full Name" }), _jsx(Input, { id: "signup-name", value: signupData.name, onChange: (e) => setSignupData({ ...signupData, name: e.target.value }), placeholder: requestData.contributorName || "Enter your name" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "signup-email", children: "Email *" }), _jsx(Input, { id: "signup-email", type: "email", value: signupData.email, onChange: (e) => setSignupData({ ...signupData, email: e.target.value }), placeholder: "Enter your email", required: true })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "signup-phone", children: "Phone Number" }), _jsx(Input, { id: "signup-phone", type: "tel", value: signupData.phone, onChange: (e) => setSignupData({ ...signupData, phone: e.target.value }), placeholder: requestData.contributorPhone || "Enter phone number" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "signup-password", children: "Password *" }), _jsxs("div", { className: "relative", children: [_jsx(Input, { id: "signup-password", type: showPassword ? "text" : "password", value: signupData.password, onChange: (e) => setSignupData({ ...signupData, password: e.target.value }), placeholder: "Create a password", required: true }), _jsx(Button, { type: "button", variant: "ghost", size: "sm", className: "absolute right-0 top-0 h-full px-3", onClick: () => setShowPassword(!showPassword), children: showPassword ? _jsx(EyeOff, { className: "h-4 w-4" }) : _jsx(Eye, { className: "h-4 w-4" }) })] })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "signup-confirm", children: "Confirm Password *" }), _jsx(Input, { id: "signup-confirm", type: "password", value: signupData.confirmPassword, onChange: (e) => setSignupData({ ...signupData, confirmPassword: e.target.value }), placeholder: "Confirm password", required: true })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { type: "submit", className: "flex-1", disabled: signupMutation.isPending, children: signupMutation.isPending ? 'Creating Account...' : 'Sign Up' }), _jsx(Button, { type: "button", variant: "outline", onClick: () => setShowSignup(false), children: "Back" })] })] }) })] }))] }) }));
}
