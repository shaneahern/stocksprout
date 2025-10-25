import React, { useState } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Mail } from 'lucide-react';
import stockSproutLogo from '@assets/StockSproutLogo_Patriotic3.png';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-white">
        {/* Mobile Status Bar */}
        <div className="bg-gray-800 text-white text-sm px-4 py-1 flex justify-between items-center">
          <span className="text-sm">9:41</span>
          <div className="flex items-center space-x-1">
            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex space-x-1">
              <div className="w-1 h-1 bg-white rounded-full"></div>
              <div className="w-1 h-1 bg-white rounded-full"></div>
              <div className="w-1 h-1 bg-white rounded-full"></div>
              <div className="w-1 h-1 bg-white rounded-full"></div>
            </div>
            <div className="w-4 h-2 border border-white rounded-sm">
              <div className="w-3 h-1 bg-white rounded-sm"></div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-60px)] px-4 py-8">
          <Card className="w-full max-w-md mx-auto shadow-lg border-0 rounded-2xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl text-center text-gray-800 font-semibold">Check Your Email</CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <Mail className="w-8 h-8 text-green-600" />
                </div>
                
                <div className="space-y-2">
                  <p className="text-gray-700">
                    We've sent a password reset link to:
                  </p>
                  <p className="font-medium text-gray-900">{email}</p>
                </div>

                <div className="space-y-3 pt-4">
                  <p className="text-sm text-gray-600">
                    Please check your email and click the link to reset your password.
                    If you don't see the email, check your spam folder.
                  </p>
                  
                  <div className="flex flex-col space-y-2">
                    <Button
                      onClick={() => setIsSubmitted(false)}
                      variant="outline"
                      className="w-full"
                    >
                      Send Another Email
                    </Button>
                    
                    <Link href="/auth">
                      <Button variant="ghost" className="w-full">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Login
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Mobile Status Bar */}
      <div className="bg-gray-800 text-white text-sm px-4 py-1 flex justify-between items-center">
        <span className="text-sm">9:41</span>
        <div className="flex items-center space-x-1">
          <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
          <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
          <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1">
            <div className="w-1 h-1 bg-white rounded-full"></div>
            <div className="w-1 h-1 bg-white rounded-full"></div>
            <div className="w-1 h-1 bg-white rounded-full"></div>
            <div className="w-1 h-1 bg-white rounded-full"></div>
          </div>
          <div className="w-4 h-2 border border-white rounded-sm">
            <div className="w-3 h-1 bg-white rounded-sm"></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-60px)] px-4 py-8">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <img 
              src={stockSproutLogo} 
              alt="StockSprout Logo" 
              className="h-24 w-auto"
            />
          </div>
          <p className="text-sm text-gray-600">
            Growing the future our kids deserve
          </p>
        </div>

        <Card className="w-full max-w-md mx-auto shadow-lg border-0 rounded-2xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl text-center text-gray-800 font-semibold">Forgot Password</CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700 font-medium">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Enter your email address"
                  className="bg-gray-50 border-gray-200 rounded-lg h-11"
                />
              </div>

              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 rounded-lg h-11 font-medium" disabled={isLoading}>
                {isLoading ? 'Sending...' : 'Send Reset Link'}
              </Button>

              <div className="text-center pt-4">
                <Link href="/auth">
                  <Button
                    type="button"
                    variant="link"
                    className="p-0 h-auto text-blue-600 font-medium"
                  >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Back to Login
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-12 text-center text-xs text-gray-600 space-y-1">
          <p>StockSprout LLC, Member NYSE, SIPC, FCC.</p>
          <p>700 Sprout Street, Phoenix, AZ 85235</p>
          <p>©2025, All rights reserved.</p>
          <Link href="/privacy-policy">
            <p className="text-blue-600 cursor-pointer hover:text-blue-800">Privacy Policy</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
