import React, { useState } from 'react';
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

export default function SproutRequestPage() {
  const { requestCode } = useParams<{ requestCode: string }>();
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
    mutationFn: async (data: any) => {
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
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleSignupSubmit = (e: React.FormEvent) => {
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
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!requestData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground mb-4">Sprout request not found or expired</p>
            <Button onClick={() => setLocation('/')}>Go Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const child = requestData.child;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">StockSprout</h1>
          <p className="mt-2 text-sm text-gray-600">Contribution Request</p>
        </div>

        {/* Child Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Gift className="w-6 h-6 text-primary" />
              <span>You've Been Invited!</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-4">
              <Avatar className="w-16 h-16 mx-auto mb-3">
                {child?.profileImageUrl ? (
                  <img src={child.profileImageUrl} alt={child.name} />
                ) : (
                  <AvatarFallback className="text-lg">
                    {child?.name?.charAt(0)?.toUpperCase()}
                  </AvatarFallback>
                )}
              </Avatar>
              <h3 className="text-xl font-bold">{child?.name}</h3>
              <p className="text-sm text-muted-foreground">Age {child?.age}</p>
            </div>

            {requestData.message && (
              <Alert className="mb-4">
                <AlertDescription>{requestData.message}</AlertDescription>
              </Alert>
            )}

            <p className="text-sm text-muted-foreground text-center">
              You've been invited to contribute to {child?.name}'s investment account.
              Help them build their financial future!
            </p>
          </CardContent>
        </Card>

        {/* Action Cards */}
        {!showSignup ? (
          <Card>
            <CardContent className="pt-6 space-y-3">
              <Button
                onClick={() => setShowSignup(true)}
                className="w-full"
                size="lg"
              >
                <UserPlus className="w-5 h-5 mr-2" />
                Create Account & Contribute
              </Button>
              <Button
                onClick={handleContinueWithoutSignup}
                variant="outline"
                className="w-full"
                size="lg"
              >
                Continue as Guest
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                Create an account to track your contributions and receive updates
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Create Your Account</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSignupSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="signup-name">Full Name</Label>
                  <Input
                    id="signup-name"
                    value={signupData.name}
                    onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
                    placeholder={requestData.contributorName || "Enter your name"}
                  />
                </div>

                <div>
                  <Label htmlFor="signup-email">Email *</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    value={signupData.email}
                    onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                    placeholder="Enter your email"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="signup-phone">Phone Number</Label>
                  <Input
                    id="signup-phone"
                    type="tel"
                    value={signupData.phone}
                    onChange={(e) => setSignupData({ ...signupData, phone: e.target.value })}
                    placeholder={requestData.contributorPhone || "Enter phone number"}
                  />
                </div>

                <div>
                  <Label htmlFor="signup-password">Password *</Label>
                  <div className="relative">
                    <Input
                      id="signup-password"
                      type={showPassword ? "text" : "password"}
                      value={signupData.password}
                      onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                      placeholder="Create a password"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="signup-confirm">Confirm Password *</Label>
                  <Input
                    id="signup-confirm"
                    type="password"
                    value={signupData.confirmPassword}
                    onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                    placeholder="Confirm password"
                    required
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="submit" className="flex-1" disabled={signupMutation.isPending}>
                    {signupMutation.isPending ? 'Creating Account...' : 'Sign Up'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowSignup(false)}
                  >
                    Back
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
