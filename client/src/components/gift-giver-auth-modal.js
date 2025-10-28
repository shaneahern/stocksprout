import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { User, UserPlus, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
export function GiftGiverAuthModal({ isOpen, onClose, onAuthenticated, childName }) {
    const [mode, setMode] = useState('choose');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const { toast } = useToast();
    const { login, signup } = useAuth();
    // Sign in form
    const [signInData, setSignInData] = useState({
        email: '',
        password: ''
    });
    // Sign up form
    const [signUpData, setSignUpData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
    });
    // Guest form
    const [guestData, setGuestData] = useState({
        name: '',
        email: ''
    });
    const handleSignIn = async () => {
        if (!signInData.email || !signInData.password) {
            toast({
                title: "Missing Information",
                description: "Please fill in all fields.",
                variant: "destructive",
            });
            return;
        }
        setIsLoading(true);
        try {
            await login(signInData.email, signInData.password);
            // Call the callback
            onAuthenticated({ name: signInData.email, email: signInData.email }, false);
            toast({
                title: "Welcome Back!",
                description: `Signed in successfully. You can now send a gift to ${childName}.`,
            });
        }
        catch (error) {
            console.error("Sign in error:", error);
            toast({
                title: "Sign In Failed",
                description: error instanceof Error ? error.message : "Invalid email or password. Please try again.",
                variant: "destructive",
            });
        }
        finally {
            setIsLoading(false);
        }
    };
    const handleSignUp = async () => {
        if (!signUpData.name || !signUpData.email || !signUpData.password || !signUpData.confirmPassword) {
            toast({
                title: "Missing Information",
                description: "Please fill in all fields.",
                variant: "destructive",
            });
            return;
        }
        if (signUpData.password !== signUpData.confirmPassword) {
            toast({
                title: "Passwords Don't Match",
                description: "Please make sure both password fields match.",
                variant: "destructive",
            });
            return;
        }
        setIsLoading(true);
        try {
            await signup({
                name: signUpData.name,
                email: signUpData.email,
                phone: signUpData.phone,
                password: signUpData.password
            });
            // User is automatically signed in after account creation
            onAuthenticated({ name: signUpData.name, email: signUpData.email }, true);
            toast({
                title: "Account Created!",
                description: `Welcome! You are now signed in and can send a gift to ${childName}.`,
            });
        }
        catch (error) {
            console.error("Sign up error:", error);
            toast({
                title: "Sign Up Failed",
                description: error instanceof Error ? error.message : "Could not create account. Please try again.",
                variant: "destructive",
            });
        }
        finally {
            setIsLoading(false);
        }
    };
    const handleContinueAsGuest = () => {
        if (!guestData.name) {
            toast({
                title: "Name Required",
                description: "Please enter your name to continue as guest.",
                variant: "destructive",
            });
            return;
        }
        const guestContributor = {
            id: `guest-${Date.now()}`,
            name: guestData.name,
            email: guestData.email || undefined
        };
        onAuthenticated(guestContributor, false);
        onClose();
    };
    const resetForm = () => {
        setSignInData({ email: '', password: '' });
        setSignUpData({
            name: '',
            email: '',
            phone: '',
            password: '',
            confirmPassword: ''
        });
        setGuestData({ name: '', email: '' });
        setShowPassword(false);
        setShowConfirmPassword(false);
    };
    const handleClose = () => {
        resetForm();
        setMode('choose');
        onClose();
    };
    return (_jsx(Dialog, { open: isOpen, onOpenChange: handleClose, children: _jsxs(DialogContent, { className: "max-w-md", children: [_jsx(DialogHeader, { children: _jsxs(DialogTitle, { children: ["Send a Gift to ", childName] }) }), _jsxs("div", { className: "space-y-4", children: [mode === 'choose' && (_jsxs("div", { className: "space-y-3", children: [_jsx("p", { className: "text-sm text-muted-foreground text-center mb-4", children: "Choose how you'd like to continue:" }), _jsx(Card, { className: "cursor-pointer hover:bg-muted/50 transition-colors", onClick: () => setMode('signin'), children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center space-x-3", children: [_jsx(User, { className: "w-6 h-6 text-primary" }), _jsxs("div", { children: [_jsx("h3", { className: "font-semibold", children: "Sign In" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "I already have an account" })] })] }) }) }), _jsx(Card, { className: "cursor-pointer hover:bg-muted/50 transition-colors", onClick: () => setMode('signup'), children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center space-x-3", children: [_jsx(UserPlus, { className: "w-6 h-6 text-primary" }), _jsxs("div", { children: [_jsx("h3", { className: "font-semibold", children: "Create Account" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Track your gifts and send more easily" })] })] }) }) }), _jsx(Card, { className: "cursor-pointer hover:bg-muted/50 transition-colors", onClick: () => setMode('guest'), children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center space-x-3", children: [_jsx(Eye, { className: "w-6 h-6 text-primary" }), _jsxs("div", { children: [_jsx("h3", { className: "font-semibold", children: "Continue as Guest" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Send a gift without creating an account" })] })] }) }) })] })), mode === 'signin' && (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h3", { className: "font-semibold", children: "Sign In" }), _jsx(Button, { variant: "ghost", size: "sm", onClick: () => setMode('choose'), children: "Back" })] }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "signin-email", children: "Email" }), _jsx(Input, { id: "signin-email", type: "email", value: signInData.email, onChange: (e) => setSignInData(prev => ({ ...prev, email: e.target.value })), placeholder: "Enter your email" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "signin-password", children: "Password" }), _jsxs("div", { className: "relative", children: [_jsx(Input, { id: "signin-password", type: showPassword ? "text" : "password", value: signInData.password, onChange: (e) => setSignInData(prev => ({ ...prev, password: e.target.value })), placeholder: "Enter your password", className: "pr-10" }), _jsx(Button, { type: "button", variant: "ghost", size: "sm", className: "absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-gray-400 hover:text-gray-700", onClick: () => setShowPassword(!showPassword), children: showPassword ? (_jsx(EyeOff, { className: "h-4 w-4" })) : (_jsx(Eye, { className: "h-4 w-4" })) })] })] })] }), _jsx(Button, { onClick: handleSignIn, disabled: isLoading, className: "w-full", children: isLoading ? "Signing In..." : "Sign In" })] })), mode === 'signup' && (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h3", { className: "font-semibold", children: "Create Account" }), _jsx(Button, { variant: "ghost", size: "sm", onClick: () => setMode('choose'), children: "Back" })] }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "signup-name", children: "Full Name" }), _jsx(Input, { id: "signup-name", value: signUpData.name, onChange: (e) => setSignUpData(prev => ({ ...prev, name: e.target.value })), placeholder: "Enter your full name" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "signup-email", children: "Email" }), _jsx(Input, { id: "signup-email", type: "email", value: signUpData.email, onChange: (e) => setSignUpData(prev => ({ ...prev, email: e.target.value })), placeholder: "Enter your email" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "signup-phone", children: "Phone (Optional)" }), _jsx(Input, { id: "signup-phone", type: "tel", value: signUpData.phone, onChange: (e) => setSignUpData(prev => ({ ...prev, phone: e.target.value })), placeholder: "Enter your phone number" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "signup-password", children: "Password" }), _jsxs("div", { className: "relative", children: [_jsx(Input, { id: "signup-password", type: showPassword ? "text" : "password", value: signUpData.password, onChange: (e) => setSignUpData(prev => ({ ...prev, password: e.target.value })), placeholder: "Create a password", className: "pr-10" }), _jsx(Button, { type: "button", variant: "ghost", size: "sm", className: "absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-gray-400 hover:text-gray-700", onClick: () => setShowPassword(!showPassword), children: showPassword ? (_jsx(EyeOff, { className: "h-4 w-4" })) : (_jsx(Eye, { className: "h-4 w-4" })) })] })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "signup-confirm", children: "Confirm Password" }), _jsxs("div", { className: "relative", children: [_jsx(Input, { id: "signup-confirm", type: showConfirmPassword ? "text" : "password", value: signUpData.confirmPassword, onChange: (e) => setSignUpData(prev => ({ ...prev, confirmPassword: e.target.value })), placeholder: "Confirm your password", className: "pr-10" }), _jsx(Button, { type: "button", variant: "ghost", size: "sm", className: "absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-gray-400 hover:text-gray-700", onClick: () => setShowConfirmPassword(!showConfirmPassword), children: showConfirmPassword ? (_jsx(EyeOff, { className: "h-4 w-4" })) : (_jsx(Eye, { className: "h-4 w-4" })) })] })] })] }), _jsx(Button, { onClick: handleSignUp, disabled: isLoading, className: "w-full", children: isLoading ? "Creating Account..." : "Create Account" })] })), mode === 'guest' && (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h3", { className: "font-semibold", children: "Continue as Guest" }), _jsx(Button, { variant: "ghost", size: "sm", onClick: () => setMode('choose'), children: "Back" })] }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "guest-name", children: "Your Name" }), _jsx(Input, { id: "guest-name", value: guestData.name, onChange: (e) => setGuestData(prev => ({ ...prev, name: e.target.value })), placeholder: "Enter your name", required: true })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "guest-email", children: "Email (Optional)" }), _jsx(Input, { id: "guest-email", type: "email", value: guestData.email, onChange: (e) => setGuestData(prev => ({ ...prev, email: e.target.value })), placeholder: "Enter your email for receipt" })] })] }), _jsx(Button, { onClick: handleContinueAsGuest, disabled: isLoading, className: "w-full", children: "Continue as Guest" })] }))] })] }) }));
}
