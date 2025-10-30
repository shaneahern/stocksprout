import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { User, UserPlus, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/contexts/AuthContext";

interface GiftGiverAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthenticated: (contributor: any, isNewUser: boolean) => void;
  childName: string;
}

interface Contributor {
  id: string;
  name: string;
  email?: string;
  phone?: string;
}

export function GiftGiverAuthModal({ 
  isOpen, 
  onClose, 
  onAuthenticated, 
  childName 
}: GiftGiverAuthModalProps) {
  const [mode, setMode] = useState<'choose' | 'signin' | 'signup' | 'guest'>('choose');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { toast } = useToast();
  const { login, signup } = useAuth();

  // Sign in form
  const [signInData, setSignInData] = useState({
    username: '',
    password: ''
  });

  // Sign up form
  const [signUpData, setSignUpData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    password: '',
    confirmPassword: ''
  });

  // Guest form
  const [guestData, setGuestData] = useState({
    name: '',
    email: ''
  });

  const handleSignIn = async () => {
    if (!signInData.username || !signInData.password) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await login(signInData.username, signInData.password);
      
      // Call the callback
      onAuthenticated({ name: signInData.username, email: `${signInData.username}@example.com` }, false);
      toast({
        title: "Welcome Back!",
        description: `Signed in successfully. You can now send a gift to ${childName}.`,
      });
    } catch (error) {
      console.error("Sign in error:", error);
      toast({
        title: "Sign In Failed",
        description: error instanceof Error ? error.message : "Invalid username or password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (!signUpData.firstName || !signUpData.lastName || !signUpData.username || !signUpData.password || !signUpData.confirmPassword) {
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

    // Validate password length
    if (signUpData.password.length < 6) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await signup({
        username: signUpData.username,
        email: `${signUpData.username}@example.com`,
        password: signUpData.password,
        name: `${signUpData.firstName} ${signUpData.lastName}`.trim(),
        bankAccountNumber: undefined,
      });
      
      // User is automatically signed in after account creation
      onAuthenticated({ name: `${signUpData.firstName} ${signUpData.lastName}`, email: `${signUpData.username}@example.com` }, true);
      toast({
        title: "Account Created!",
        description: `Welcome! You are now signed in and can send a gift to ${childName}.`,
      });
    } catch (error) {
      console.error("Sign up error:", error);
      toast({
        title: "Sign Up Failed",
        description: error instanceof Error ? error.message : "Could not create account. Please try again.",
        variant: "destructive",
      });
    } finally {
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
    setSignInData({ username: '', password: '' });
    setSignUpData({ 
      firstName: '', 
      lastName: '', 
      username: '', 
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

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Send a Gift to {childName}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Mode Selection */}
          {mode === 'choose' && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground text-center mb-4">
                Choose how you'd like to continue:
              </p>
              
              <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setMode('signin')}>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <User className="w-6 h-6 text-primary" />
                    <div>
                      <h3 className="font-semibold">Sign In</h3>
                      <p className="text-sm text-muted-foreground">I already have an account</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setMode('signup')}>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <UserPlus className="w-6 h-6 text-primary" />
                    <div>
                      <h3 className="font-semibold">Create Account</h3>
                      <p className="text-sm text-muted-foreground">Track your gifts and send more easily</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setMode('guest')}>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <Eye className="w-6 h-6 text-primary" />
                    <div>
                      <h3 className="font-semibold">Continue as Guest</h3>
                      <p className="text-sm text-muted-foreground">Send a gift without creating an account</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Sign In Form */}
          {mode === 'signin' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Sign In</h3>
                <Button variant="ghost" size="sm" onClick={() => setMode('choose')}>
                  Back
                </Button>
              </div>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="signin-username" className="text-sm font-medium text-black">Username</Label>
                  <Input
                    id="signin-username"
                    type="text"
                    value={signInData.username}
                    onChange={(e) => setSignInData(prev => ({ ...prev, username: e.target.value }))}
                    placeholder="Enter your username"
                    className="pr-12"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password" className="text-sm font-medium text-black">Password</Label>
                  <div className="relative">
                    <Input
                      id="signin-password"
                      type={showPassword ? "text" : "password"}
                      value={signInData.password}
                      onChange={(e) => setSignInData(prev => ({ ...prev, password: e.target.value }))}
                      placeholder="Enter your password"
                      className="pr-12"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-gray-400 hover:text-gray-700"
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
              </div>
              
              <Button onClick={handleSignIn} disabled={isLoading} className="w-full bg-[#265FDC] hover:bg-[#1e4db8] rounded-[5px] text-white text-sm font-semibold" style={{ height: '40px' }}>
                {isLoading ? "Signing In..." : "Sign In"}
              </Button>
            </div>
          )}

          {/* Sign Up Form */}
          {mode === 'signup' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Create Account</h3>
                <Button variant="ghost" size="sm" onClick={() => setMode('choose')}>
                  Back
                </Button>
              </div>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="signup-first-name" className="text-sm font-medium text-black">First Name</Label>
                  <Input
                    id="signup-first-name"
                    value={signUpData.firstName}
                    onChange={(e) => setSignUpData(prev => ({ ...prev, firstName: e.target.value }))}
                    placeholder="Enter your first name"
                    className="pr-12"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-last-name" className="text-sm font-medium text-black">Last Name</Label>
                  <Input
                    id="signup-last-name"
                    value={signUpData.lastName}
                    onChange={(e) => setSignUpData(prev => ({ ...prev, lastName: e.target.value }))}
                    placeholder="Enter your last name"
                    className="pr-12"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-username" className="text-sm font-medium text-black">Username</Label>
                  <Input
                    id="signup-username"
                    value={signUpData.username}
                    onChange={(e) => setSignUpData(prev => ({ ...prev, username: e.target.value }))}
                    placeholder="Enter your username"
                    className="pr-12"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password" className="text-sm font-medium text-black">Password</Label>
                  <div className="relative">
                    <Input
                      id="signup-password"
                      type={showPassword ? "text" : "password"}
                      value={signUpData.password}
                      onChange={(e) => setSignUpData(prev => ({ ...prev, password: e.target.value }))}
                      placeholder="Create your password"
                      className="pr-12"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-gray-400 hover:text-gray-700"
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
                <div className="space-y-2">
                  <Label htmlFor="signup-confirm" className="text-sm font-medium text-black">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="signup-confirm"
                      type={showConfirmPassword ? "text" : "password"}
                      value={signUpData.confirmPassword}
                      onChange={(e) => setSignUpData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      placeholder="Confirm your password"
                      className="pr-12"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-gray-400 hover:text-gray-700"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
              
              <Button onClick={handleSignUp} disabled={isLoading} className="w-full bg-[#265FDC] hover:bg-[#1e4db8] rounded-[5px] text-white text-sm font-semibold" style={{ height: '40px' }}>
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>
            </div>
          )}

          {/* Guest Form */}
          {mode === 'guest' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Continue as Guest</h3>
                <Button variant="ghost" size="sm" onClick={() => setMode('choose')}>
                  Back
                </Button>
              </div>
              
              <div className="space-y-3">
                <div>
                  <Label htmlFor="guest-name">Your Name</Label>
                  <Input
                    id="guest-name"
                    value={guestData.name}
                    onChange={(e) => setGuestData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter your name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="guest-email">Email (Optional)</Label>
                  <Input
                    id="guest-email"
                    type="email"
                    value={guestData.email}
                    onChange={(e) => setGuestData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter your email for receipt"
                  />
                </div>
              </div>
              
              <Button onClick={handleContinueAsGuest} disabled={isLoading} className="w-full">
                Continue as Guest
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
