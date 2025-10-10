import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Eye, EyeOff, User, Lock, Smartphone } from 'lucide-react';
import { webAuthnService } from '@/lib/webauthn';

interface LoginFormProps {
  onSwitchToSignup: () => void;
}

export function LoginForm({ onSwitchToSignup }: LoginFormProps) {
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
      } catch (error) {
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
    } catch (error: any) {
      const errorMessage = webAuthnService.getErrorMessage(error);
      setError(errorMessage);
    } finally {
      setIsBiometricLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(formData.username, formData.password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg border-0 rounded-2xl">
      <CardHeader className="pb-4">
        <CardTitle className="text-2xl text-center text-gray-800 font-semibold">Welcome In</CardTitle>
      </CardHeader>
      <CardContent className="px-6 pb-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="username" className="text-gray-700 font-medium">Username</Label>
            <Input
              id="username"
              name="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
              required
              placeholder="Enter your username"
              className="bg-gray-50 border-gray-200 rounded-lg h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-gray-700 font-medium">Password</Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Enter your password."
                className="bg-gray-50 border-gray-200 rounded-lg h-11 pr-12"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-gray-400"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 rounded-lg h-11 font-medium" disabled={isLoading}>
            {isLoading ? 'Signing In...' : 'Sign In'}
          </Button>

          {/* Remember Me and Face ID */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="remember-me" 
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked === true)}
                className="w-4 h-4"
              />
              <Label htmlFor="remember-me" className="text-sm text-gray-600 cursor-pointer">
                Remember me
              </Label>
            </div>
            <div className="flex items-center space-x-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleBiometricAuth}
                disabled={!isBiometricSupported || isBiometricLoading}
                className="p-1 h-auto hover:bg-transparent"
              >
                {isBiometricSupported ? (
                  <div className="w-7 h-7 flex items-center justify-center">
                    <img 
                      src="/faceid-icon.png" 
                      alt="Face ID" 
                      className="w-6 h-6"
                    />
                  </div>
                ) : (
                  <div className="w-7 h-7 flex items-center justify-center">
                    <img 
                      src="/faceid-icon.png" 
                      alt="Face ID" 
                      className="w-6 h-6 opacity-40"
                    />
                  </div>
                )}
              </Button>
              <Button
                type="button"
                variant="link"
                size="sm"
                onClick={handleBiometricAuth}
                disabled={!isBiometricSupported || isBiometricLoading}
                className="p-0 h-auto text-blue-500 font-normal hover:text-blue-600 disabled:text-gray-400 text-base font-sans"
              >
                {isBiometricLoading ? 'Authenticating...' : isBiometricSupported ? 'Face ID' : 'Face ID'}
              </Button>
            </div>
          </div>

          {/* Links below form */}
          <div className="space-y-3 pt-4">
            <div className="flex items-center space-x-2 text-sm">
              <User className="w-4 h-4 text-gray-600" />
              <span className="text-gray-600">Don't have an account? </span>
              <Button
                type="button"
                variant="link"
                className="p-0 h-auto text-blue-600 font-medium"
                onClick={onSwitchToSignup}
              >
                Sign up
              </Button>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <Lock className="w-4 h-4 text-gray-600" />
              <Link href="/forgot-password">
                <Button
                  type="button"
                  variant="link"
                  className="p-0 h-auto text-blue-600 font-medium"
                >
                  Forgot username or password?
                </Button>
              </Link>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
