import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Eye, EyeOff, User, Lock } from 'lucide-react';
import { webAuthnService } from '@/lib/webauthn';
export function LoginForm({ onSwitchToSignup }) {
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        username: '',
        password: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isBiometricSupported, setIsBiometricSupported] = useState(false);
    const [isBiometricLoading, setIsBiometricLoading] = useState(false);
    // Check biometric support on component mount
    useEffect(() => {
        const checkBiometricSupport = async () => {
            try {
                const supported = await webAuthnService.isBiometricSupported();
                setIsBiometricSupported(supported);
            }
            catch (error) {
                console.log('Biometric check failed:', error);
                setIsBiometricSupported(false);
            }
        };
        checkBiometricSupport();
    }, []);
    const handleBiometricAuth = async () => {
        setIsBiometricLoading(true);
        setError('');
        try {
            // For now, we'll use a mock implementation since we don't have stored credentials yet
            // In a real implementation, you'd fetch the user's registered credential IDs from the server
            const mockCredentialIds = ['mock-credential-id']; // This would come from the server
            const authResult = await webAuthnService.authenticateBiometric(mockCredentialIds);
            if (authResult.success) {
                // In a real implementation, you'd send this to your server for verification
                // For now, we'll show a success message and suggest using password
                setError('Biometric authentication successful! Please use your password to complete login.');
            }
        }
        catch (error) {
            const errorMessage = webAuthnService.getErrorMessage(error);
            setError(errorMessage);
        }
        finally {
            setIsBiometricLoading(false);
        }
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            await login(formData.username, formData.password);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Login failed');
        }
        finally {
            setIsLoading(false);
        }
    };
    const handleChange = (e) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };
    return (_jsxs("div", { className: "w-full max-w-md mx-auto", children: [_jsxs(Card, { className: "border border-gray-200 shadow-lg rounded-xl bg-white", children: [_jsx(CardHeader, { className: "text-center pb-6", children: _jsx(CardTitle, { className: "text-[15px] font-semibold text-black", children: "Welcome In" }) }), _jsx(CardContent, { children: _jsxs("form", { onSubmit: handleSubmit, className: "space-y-6", children: [error && (_jsx(Alert, { variant: "destructive", className: "mb-4", children: _jsx(AlertDescription, { children: error }) })), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "username", className: "text-[12px] font-medium text-black", children: "Username" }), _jsx(Input, { id: "username", name: "username", type: "text", value: formData.username, onChange: handleChange, required: true, placeholder: "Enter your username", className: "pr-12" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "password", className: "text-[12px] font-medium text-black", children: "Password" }), _jsxs("div", { className: "relative", children: [_jsx(Input, { id: "password", name: "password", type: showPassword ? "text" : "password", value: formData.password, onChange: handleChange, required: true, placeholder: "Enter your password", className: "pr-12" }), _jsx(Button, { type: "button", variant: "ghost", size: "sm", className: "absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-gray-400 hover:text-gray-700", onClick: () => setShowPassword(!showPassword), children: showPassword ? (_jsx(EyeOff, { className: "h-4 w-4" })) : (_jsx(Eye, { className: "h-4 w-4" })) })] })] }), _jsx(Button, { type: "submit", className: "w-full bg-[#265FDC] hover:bg-[#1e4db8] rounded-[5px] text-white text-[10px] font-semibold", style: { height: '30.19px' }, disabled: isLoading, children: isLoading ? 'Signing In...' : 'Sign In' }), _jsxs("div", { className: "flex items-center justify-between pt-2", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Checkbox, { id: "remember-me", checked: rememberMe, onCheckedChange: (checked) => setRememberMe(checked === true), className: "w-4 h-4" }), _jsx(Label, { htmlFor: "remember-me", className: "text-[10px] font-light text-black cursor-pointer", children: "Remember me" })] }), _jsxs("div", { className: "flex items-center space-x-1", children: [_jsx(Button, { type: "button", variant: "ghost", size: "sm", onClick: handleBiometricAuth, disabled: !isBiometricSupported || isBiometricLoading, className: "p-1 h-auto hover:bg-transparent", children: isBiometricSupported ? (_jsx("div", { className: "w-7 h-7 flex items-center justify-center", children: _jsx("img", { src: "/faceid-icon.png", alt: "Face ID", className: "w-6 h-6" }) })) : (_jsx("div", { className: "w-7 h-7 flex items-center justify-center", children: _jsx("img", { src: "/faceid-icon.png", alt: "Face ID", className: "w-6 h-6 opacity-40" }) })) }), _jsx(Button, { type: "button", variant: "link", size: "sm", onClick: handleBiometricAuth, disabled: !isBiometricSupported || isBiometricLoading, className: "p-0 h-auto text-[#265FDC] font-light hover:text-[#1e4db8] disabled:text-gray-400 text-[10px]", children: isBiometricLoading ? 'Authenticating...' : isBiometricSupported ? 'Face ID' : 'Face ID' })] })] })] }) })] }), _jsxs("div", { className: "space-y-4 pt-6", children: [_jsxs("div", { className: "flex items-center justify-center space-x-2 text-[14px]", children: [_jsx(User, { className: "w-4 h-4 text-gray-600" }), _jsx("span", { className: "text-black", children: "Don't have an account? " }), _jsx(Button, { type: "button", variant: "link", className: "p-0 h-auto text-[#265FDC] font-medium text-[14px]", onClick: onSwitchToSignup, children: "Sign up" })] }), _jsxs("div", { className: "flex items-center justify-center space-x-2 text-[14px]", children: [_jsx(Lock, { className: "w-4 h-4 text-gray-600" }), _jsx(Link, { href: "/forgot-password", children: _jsx(Button, { type: "button", variant: "link", className: "p-0 h-auto text-[#265FDC] font-medium text-[14px]", children: "Forgot username or password?" }) })] })] })] }));
}
