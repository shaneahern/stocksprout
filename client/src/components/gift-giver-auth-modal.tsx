import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { User, UserPlus, Eye } from "lucide-react";
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
  const { toast } = useToast();
  const { contributorSignin, contributorSignup } = useAuth();

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
    confirmPassword: '',
    profileImageUrl: ''
  });

  // Guest form
  const [guestData, setGuestData] = useState({
    name: '',
    email: '',
    profileImageUrl: ''
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
      const contributorData = await contributorSignin(signInData.email, signInData.password);
      
      // Call the callback with the returned contributor data
      onAuthenticated(contributorData, false);
      toast({
        title: "Welcome Back!",
        description: `Signed in successfully. You can now send a gift to ${childName}.`,
      });
    } catch (error) {
      console.error("Sign in error:", error);
      toast({
        title: "Sign In Failed",
        description: error instanceof Error ? error.message : "Invalid email or password. Please try again.",
        variant: "destructive",
      });
    } finally {
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
      const contributorData = await contributorSignup({
        name: signUpData.name,
        email: signUpData.email,
        phone: signUpData.phone,
        password: signUpData.password,
        profileImageUrl: signUpData.profileImageUrl || undefined
      });
      
      // User is automatically signed in after account creation
      onAuthenticated(contributorData, true);
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
      email: guestData.email || undefined,
      profileImageUrl: guestData.profileImageUrl || undefined
    };

    onAuthenticated(guestContributor, false);
    onClose(); // Close the modal after guest continues
  };

  const resetForm = () => {
    setSignInData({ email: '', password: '' });
    setSignUpData({ 
      name: '', 
      email: '', 
      phone: '', 
      password: '', 
      confirmPassword: '',
      profileImageUrl: ''
    });
    setGuestData({ name: '', email: '', profileImageUrl: '' });
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
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Sign In</h3>
                <Button variant="ghost" size="sm" onClick={() => setMode('choose')}>
                  Back
                </Button>
              </div>
              
              <div className="space-y-3">
                <div>
                  <Label htmlFor="signin-email">Email</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    value={signInData.email}
                    onChange={(e) => setSignInData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter your email"
                  />
                </div>
                <div>
                  <Label htmlFor="signin-password">Password</Label>
                  <Input
                    id="signin-password"
                    type="password"
                    value={signInData.password}
                    onChange={(e) => setSignInData(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Enter your password"
                  />
                </div>
              </div>
              
              <Button onClick={handleSignIn} disabled={isLoading} className="w-full">
                {isLoading ? "Signing In..." : "Sign In"}
              </Button>
            </div>
          )}

          {/* Sign Up Form */}
          {mode === 'signup' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Create Account</h3>
                <Button variant="ghost" size="sm" onClick={() => setMode('choose')}>
                  Back
                </Button>
              </div>
              
              <div className="space-y-3">
                <div>
                  <Label htmlFor="signup-name">Full Name</Label>
                  <Input
                    id="signup-name"
                    value={signUpData.name}
                    onChange={(e) => setSignUpData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    value={signUpData.email}
                    onChange={(e) => setSignUpData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter your email"
                  />
                </div>
                <div>
                  <Label htmlFor="signup-phone">Phone (Optional)</Label>
                  <Input
                    id="signup-phone"
                    type="tel"
                    value={signUpData.phone}
                    onChange={(e) => setSignUpData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Enter your phone number"
                  />
                </div>
                <div>
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    value={signUpData.password}
                    onChange={(e) => setSignUpData(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Create a password"
                  />
                </div>
                <div>
                  <Label htmlFor="signup-confirm">Confirm Password</Label>
                  <Input
                    id="signup-confirm"
                    type="password"
                    value={signUpData.confirmPassword}
                    onChange={(e) => setSignUpData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    placeholder="Confirm your password"
                  />
                </div>
                <div>
                  <Label htmlFor="signup-profile-image">Profile Image URL (Optional)</Label>
                  <Input
                    id="signup-profile-image"
                    type="url"
                    value={signUpData.profileImageUrl}
                    onChange={(e) => setSignUpData(prev => ({ ...prev, profileImageUrl: e.target.value }))}
                    placeholder="https://example.com/your-photo.jpg"
                  />
                </div>
              </div>
              
              <Button onClick={handleSignUp} disabled={isLoading} className="w-full">
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
                <div>
                  <Label htmlFor="guest-profile-image">Profile Image URL (Optional)</Label>
                  <Input
                    id="guest-profile-image"
                    type="url"
                    value={guestData.profileImageUrl}
                    onChange={(e) => setGuestData(prev => ({ ...prev, profileImageUrl: e.target.value }))}
                    placeholder="https://example.com/your-photo.jpg"
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
