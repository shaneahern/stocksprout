import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff } from 'lucide-react';
export function SignupForm({ onSwitchToLogin }) {
    const { signup } = useAuth();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        username: '',
        password: '',
        confirmPassword: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        // Validate passwords match
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        // Validate password length
        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters long');
            return;
        }
        setIsLoading(true);
        try {
            await signup({
                username: formData.username,
                email: `${formData.username}@example.com`, // Generate email from username for now
                password: formData.password,
                name: `${formData.firstName} ${formData.lastName}`.trim(),
                bankAccountNumber: undefined,
            });
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Signup failed');
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
    return (_jsx("div", { className: "w-full max-w-md mx-auto", children: _jsxs(Card, { className: "border border-gray-200 shadow-lg rounded-xl bg-white", children: [_jsx(CardHeader, { className: "text-center pb-6", children: _jsx(CardTitle, { className: "text-[15px] font-semibold text-black", children: "Create Account" }) }), _jsx(CardContent, { children: _jsxs("form", { onSubmit: handleSubmit, className: "space-y-6", children: [error && (_jsx(Alert, { variant: "destructive", className: "mb-4", children: _jsx(AlertDescription, { children: error }) })), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "firstName", className: "text-[12px] font-medium text-black", children: "First Name" }), _jsx(Input, { id: "firstName", name: "firstName", type: "text", value: formData.firstName, onChange: handleChange, required: true, placeholder: "Enter your first name", className: "pr-12" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "lastName", className: "text-[12px] font-medium text-black", children: "Last Name" }), _jsx(Input, { id: "lastName", name: "lastName", type: "text", value: formData.lastName, onChange: handleChange, required: true, placeholder: "Enter your last name", className: "pr-12" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "username", className: "text-[12px] font-medium text-black", children: "Username" }), _jsx(Input, { id: "username", name: "username", type: "text", value: formData.username, onChange: handleChange, required: true, placeholder: "Enter your username", className: "pr-12" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "password", className: "text-[12px] font-medium text-black", children: "Password" }), _jsxs("div", { className: "relative", children: [_jsx(Input, { id: "password", name: "password", type: showPassword ? "text" : "password", value: formData.password, onChange: handleChange, required: true, placeholder: "Create your password", className: "pr-12" }), _jsx(Button, { type: "button", variant: "ghost", size: "sm", className: "absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-gray-400 hover:text-gray-700", onClick: () => setShowPassword(!showPassword), children: showPassword ? (_jsx(EyeOff, { className: "h-4 w-4" })) : (_jsx(Eye, { className: "h-4 w-4" })) })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "confirmPassword", className: "text-[12px] font-medium text-black", children: "Confirm Password" }), _jsxs("div", { className: "relative", children: [_jsx(Input, { id: "confirmPassword", name: "confirmPassword", type: showConfirmPassword ? "text" : "password", value: formData.confirmPassword, onChange: handleChange, required: true, placeholder: "Confirm your password", className: "pr-12" }), _jsx(Button, { type: "button", variant: "ghost", size: "sm", className: "absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-gray-400 hover:text-gray-700", onClick: () => setShowConfirmPassword(!showConfirmPassword), children: showConfirmPassword ? (_jsx(EyeOff, { className: "h-4 w-4" })) : (_jsx(Eye, { className: "h-4 w-4" })) })] })] }), _jsx(Button, { type: "submit", className: "w-full bg-[#265FDC] hover:bg-[#1e4db8] rounded-[5px] text-white text-[10px] font-semibold", style: { height: '30.19px' }, disabled: isLoading, children: isLoading ? 'Creating Account...' : 'Create Account' })] }) })] }) }));
}
