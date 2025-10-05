import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import InvestmentSelector from "@/components/investment-selector";
import VideoRecorder from "@/components/video-recorder";
import MockPaymentForm from "@/components/mock-payment-form";
import { RecurringContributionSetup } from "@/components/recurring-contribution-setup";
import { GiftGiverAuthModal } from "@/components/gift-giver-auth-modal";
import { CheckCircle, Gift, DollarSign, MessageSquare, Video, CreditCard, Camera, Upload, X, Image } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";

export default function GiftGiver() {
  const [, params] = useRoute("/gift/:giftCode");
  const [, setLocation] = useLocation();
  const giftCode = params?.giftCode;
  const { toast } = useToast();
  const { contributor: authContributor, contributorToken, isLoading: authLoading } = useAuth();
  
  const [selectedInvestment, setSelectedInvestment] = useState<any>(null);
  const [amount, setAmount] = useState("150");
  const [shares, setShares] = useState("");
  const [message, setMessage] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [giftGiverName, setGiftGiverName] = useState("");
  const [giftGiverEmail, setGiftGiverEmail] = useState("");
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [giftSent, setGiftSent] = useState(false);
  
  // Show auth modal only if not authenticated and not loading
  const shouldShowAuthModal = !authContributor && !authLoading;
  
  
  // Profile photo state
  const [profileImageUrl, setProfileImageUrl] = useState("");
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraMode, setCameraMode] = useState<'url' | 'camera' | 'gallery'>('url');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const { data: child, isLoading } = useQuery({
    queryKey: ["/api/children/by-gift-code", giftCode],
    enabled: !!giftCode,
  });

  // Type guard for child data
  const typedChild = child as any;

  // Handle authentication
  const handleAuthenticated = (contributorData: any, isNewUser: boolean) => {
      // The AuthContext already handles the authentication state
      // We just need to pre-fill the form
      // The modal will automatically hide because shouldShowAuthModal will be false
      
      // Pre-fill form with contributor data
      setGiftGiverName(contributorData.name);
      setGiftGiverEmail(contributorData.email || '');
      setProfileImageUrl(contributorData.profileImageUrl || '');
    
    // If it's a new user, we might want to connect them to this child for future gifts
    if (isNewUser && contributorData.id && !contributorData.id.startsWith('guest-')) {
      // TODO: Connect contributor to child for future gifts
      console.log('New contributor created:', contributorData);
    }
  };

  // Camera functionality handlers
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 }
        } 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraMode('camera');
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast({
        title: "Camera Access Error",
        description: "Unable to access camera. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext('2d');
      
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0);
        
        const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setCapturedImage(imageDataUrl);
        setProfileImageUrl(imageDataUrl);
        stopCamera();
      }
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    setProfileImageUrl('');
    startCamera();
  };

  const handleGallerySelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setCapturedImage(result);
        setProfileImageUrl(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const switchToUrlMode = () => {
    stopCamera();
    setCameraMode('url');
  };

  const switchToGalleryMode = () => {
    stopCamera();
    setCameraMode('gallery');
  };

  const updateProfilePhoto = async () => {
    try {
      // If user is authenticated and has a contributor ID, save to database
      if (authContributor?.id && profileImageUrl && contributorToken) {
        const response = await fetch(`/api/contributors/${authContributor.id}/profile-photo`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${contributorToken}`,
          },
          body: JSON.stringify({ profileImageUrl }),
        });
        
        if (response.ok) {
          const updatedContributor = await response.json();
          // Note: The AuthContext will handle updating the contributor state
          // We don't need to update local state anymore
          toast({
            title: "Profile Photo Updated",
            description: "Your profile photo has been saved to your account.",
          });
        } else {
          throw new Error("Failed to save profile photo");
        }
      } else {
        toast({
          title: "Profile Photo Updated",
          description: "Your profile photo has been updated.",
        });
      }
    } catch (error) {
      console.error("Error updating profile photo:", error);
      toast({
        title: "Error",
        description: "Failed to save profile photo. It will be used for this gift only.",
        variant: "destructive",
      });
    }
    
    setIsCameraOpen(false);
    setCapturedImage(null);
    setCameraMode('url');
  };

  // Auto-authenticate if contributor is already logged in
  useEffect(() => {
    if (authContributor && contributorToken) {
      // Pre-fill form with contributor data
      setGiftGiverName(authContributor.name);
      setGiftGiverEmail(authContributor.email || '');
      setProfileImageUrl(authContributor.profileImageUrl || '');
    }
  }, [authContributor, contributorToken, authLoading]);

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const sendGiftMutation = useMutation({
    mutationFn: async (giftData: any) => {
      const response = await apiRequest("POST", "/api/gifts", giftData);
      return response.json();
    },
    onSuccess: () => {
      // Invalidate relevant caches
      queryClient.invalidateQueries({ queryKey: ["/api/children"] });
      queryClient.invalidateQueries({ queryKey: ["/api/portfolio", typedChild.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/gifts", typedChild.id] });
      
      setGiftSent(true);
      
      toast({
        title: "Gift Sent Successfully!",
        description: "Your investment gift has been sent to the child's portfolio.",
      });
      
      // Reset form but keep payment confirmation
      setSelectedInvestment(null);
      setAmount("150");
      setMessage("");
      setVideoUrl("");
      setShowPayment(false);
      // Note: Keep paymentId and giftGiverName for confirmation display
    },
    onError: () => {
      // Clear payment state on error
      setPaymentId(null);
      setShowPayment(false);
      
      toast({
        title: "Error Sending Gift",
        description: "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const handlePaymentSuccess = (paymentId: string) => {
    setPaymentId(paymentId);
    setShowPayment(false);
    
    // Validate amount
    const amountNum = Number(amount);
    if (amountNum <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount greater than $0.",
        variant: "destructive",
      });
      return;
    }
    
    // Proceed with gift creation after successful payment
    const giftData = {
      childId: typedChild.id,
      giftGiverName,
      giftGiverEmail,
      contributorId: authContributor?.id || null, // Include contributor ID if authenticated
      giftGiverProfileImageUrl: profileImageUrl || authContributor?.profileImageUrl || null, // Use current profile image
      investmentId: selectedInvestment.id,
      amount: amountNum.toString(),
      message,
      videoMessageUrl: videoUrl || undefined,
      paymentId,
    };

    sendGiftMutation.mutate(giftData);
  };

  const handlePaymentError = (error: string) => {
    toast({
      title: "Payment Failed",
      description: error,
      variant: "destructive",
    });
  };

  // Bidirectional amount/shares handlers - MUST BE BEFORE CONDITIONAL RETURNS
  const handleAmountChange = (newAmount: string) => {
    setAmount(newAmount);
    if (selectedInvestment && newAmount) {
      const calculatedShares = (parseFloat(newAmount) / parseFloat(selectedInvestment.currentPrice)).toFixed(4);
      setShares(calculatedShares);
    } else {
      setShares("");
    }
  };

  const handleSharesChange = (newShares: string) => {
    setShares(newShares);
    if (selectedInvestment && newShares) {
      const calculatedAmount = (parseFloat(newShares) * parseFloat(selectedInvestment.currentPrice)).toFixed(2);
      setAmount(calculatedAmount);
    } else {
      setAmount("");
    }
  };

  // Initialize shares when investment is selected (only runs when investment changes)
  useEffect(() => {
    if (selectedInvestment && amount && !shares) {
      const calculatedShares = (parseFloat(amount) / parseFloat(selectedInvestment.currentPrice)).toFixed(4);
      setShares(calculatedShares);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedInvestment]);

  const handleSendGift = () => {
    if (!typedChild || !selectedInvestment || !giftGiverName) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    // If payment is already completed, don't allow re-processing
    if (paymentId && !sendGiftMutation.isPending) {
      toast({
        title: "Gift Already Sent",
        description: "This gift has already been processed successfully.",
      });
      return;
    }

    // Show payment form if payment not completed
    if (!paymentId) {
      setShowPayment(true);
    }
  };

  if (isLoading || authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!typedChild) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <h1 className="text-2xl font-bold text-destructive mb-4">Invalid Gift Link</h1>
            <p className="text-muted-foreground">
              This gift link is not valid or has expired.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const estimatedShares = shares || "0";

  return (
    <div className="min-h-screen bg-background">
      {/* Authentication Modal */}
      <GiftGiverAuthModal
        isOpen={shouldShowAuthModal}
        onClose={() => {}} // Modal will hide automatically when authenticated
        onAuthenticated={handleAuthenticated}
        childName={typedChild?.name || 'this child'}
      />
      
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-accent text-white p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold">StockSprout</h1>
              <p className="text-white/90 text-sm sm:text-base">Send an investment gift to {typedChild.name}</p>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
              {authContributor && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setLocation("/")}
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  Go to Dashboard
                </Button>
              )}
              <div className="text-left sm:text-right">
                <p className="text-xs sm:text-sm text-white/80">Gift Link Code</p>
                <p className="font-mono text-base sm:text-lg font-bold">{giftCode}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6 sm:space-y-8">
        {/* Child Verification */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="w-6 h-6 text-success" />
              <span>Confirm Gift Recipient</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 bg-muted rounded-xl p-4 sm:p-6">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-primary rounded-full flex items-center justify-center text-white text-xl sm:text-2xl font-bold">
                {typedChild.name.charAt(0)}
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h3 className="text-xl sm:text-2xl font-bold text-foreground">{typedChild.name}</h3>
                <p className="text-muted-foreground text-base sm:text-lg">
                  {typedChild.age} years old
                  {typedChild.birthday && ` • Birthday: ${typedChild.birthday}`}
                </p>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-success rounded-full flex items-center justify-center mb-2">
                  <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-success-foreground" />
                </div>
                <p className="text-success font-semibold text-sm sm:text-base">Verified</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Your Information */}
        <Card>
          <CardHeader>
            <CardTitle>Your Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Profile Photo Section */}
            <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-muted rounded-xl">
              <div className="relative">
                <Avatar className="w-16 h-16">
                  {profileImageUrl ? (
                    <img src={profileImageUrl} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <AvatarFallback className="text-lg">
                      {giftGiverName.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                    </AvatarFallback>
                  )}
                </Avatar>
                <Dialog open={isCameraOpen} onOpenChange={setIsCameraOpen}>
                  <DialogTrigger asChild>
                    <Button
                      size="sm"
                      className="absolute -bottom-1 -right-1 rounded-full w-6 h-6 p-0"
                      variant="secondary"
                      onClick={() => setIsCameraOpen(true)}
                    >
                      <Camera className="w-3 h-3" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Add Profile Photo</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      {/* Mode Selection */}
                      {!capturedImage && cameraMode === 'url' && (
                        <div className="grid grid-cols-3 gap-2 mb-4">
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => setCameraMode('url')}
                            className="flex-1"
                          >
                            <Upload className="w-4 h-4 mr-1" />
                            URL
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleGallerySelect}
                            className="flex-1"
                          >
                            <Image className="w-4 h-4 mr-1" />
                            Gallery
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={startCamera}
                            className="flex-1"
                          >
                            <Camera className="w-4 h-4 mr-1" />
                            Camera
                          </Button>
                        </div>
                      )}

                      {/* URL Input Mode */}
                      {cameraMode === 'url' && !capturedImage && (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">Image URL</label>
                            <Input
                              value={profileImageUrl}
                              onChange={(e) => setProfileImageUrl(e.target.value)}
                              placeholder="Enter image URL"
                            />
                          </div>
                          <Button onClick={updateProfilePhoto} className="w-full">
                            Use This Photo
                          </Button>
                        </div>
                      )}

                      {/* Gallery Mode */}
                      {cameraMode === 'gallery' && !capturedImage && (
                        <div className="space-y-4 text-center">
                          <div className="p-8 border-2 border-dashed border-muted-foreground/25 rounded-lg">
                            <Image className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground mb-4">
                              Select a photo from your device
                            </p>
                            <Button onClick={handleGallerySelect} variant="outline">
                              Choose Photo
                            </Button>
                          </div>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileSelect}
                            className="hidden"
                          />
                          <Button variant="outline" onClick={switchToUrlMode} className="w-full">
                            Back to URL
                          </Button>
                        </div>
                      )}

                      {/* Camera Mode */}
                      {cameraMode === 'camera' && !capturedImage && (
                        <div className="space-y-4">
                          <div className="relative">
                            <video
                              ref={videoRef}
                              autoPlay
                              playsInline
                              muted
                              className="w-full h-64 object-cover rounded-lg bg-gray-100"
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={switchToUrlMode}
                              className="absolute top-2 right-2"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="flex space-x-2">
                            <Button onClick={capturePhoto} className="flex-1">
                              <Camera className="w-4 h-4 mr-2" />
                              Take Photo
                            </Button>
                            <Button variant="outline" onClick={switchToUrlMode} className="flex-1">
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Captured Image Preview */}
                      {capturedImage && (
                        <div className="space-y-4">
                          <div className="relative">
                            <img
                              src={capturedImage}
                              alt="Captured"
                              className="w-full h-64 object-cover rounded-lg"
                            />
                          </div>
                          <div className="flex space-x-2">
                            <Button onClick={updateProfilePhoto} className="flex-1">
                              Use This Photo
                            </Button>
                            <Button variant="outline" onClick={retakePhoto} className="flex-1">
                              Retake
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Hidden canvas for image capture */}
                      <canvas ref={canvasRef} className="hidden" />
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h3 className="font-semibold text-foreground">Profile Photo</h3>
                <p className="text-sm text-muted-foreground">
                  Add a photo to personalize your gift
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Your Name *
                </label>
                <Input
                  value={giftGiverName}
                  onChange={(e) => setGiftGiverName(e.target.value)}
                  placeholder="Enter your name"
                  data-testid="input-giver-name"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Your Email (Optional)
                </label>
                <Input
                  type="email"
                  value={giftGiverEmail}
                  onChange={(e) => setGiftGiverEmail(e.target.value)}
                  placeholder="Enter your email"
                  data-testid="input-giver-email"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Investment Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <DollarSign className="w-6 h-6" />
              <span>Choose an Investment</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <InvestmentSelector
              selectedInvestment={selectedInvestment}
              onSelectInvestment={setSelectedInvestment}
            />
          </CardContent>
        </Card>

        {/* Gift Amount */}
        <Card>
          <CardHeader>
            <CardTitle>Gift Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Dollar Amount
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground text-xl">
                    $
                  </span>
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => handleAmountChange(e.target.value)}
                    className="pl-8 text-2xl font-bold h-12"
                    min="0.01"
                    step="0.01"
                    data-testid="input-gift-amount"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Number of Shares
                </label>
                <div className="relative">
                  <Input
                    type="number"
                    value={shares}
                    onChange={(e) => handleSharesChange(e.target.value)}
                    className="text-2xl font-bold h-12"
                    min="0.0001"
                    step="0.0001"
                    placeholder="0.0000"
                    data-testid="input-gift-shares"
                  />
                </div>
                {selectedInvestment && (
                  <p className="text-sm text-muted-foreground mt-1">
                    shares of {selectedInvestment.name}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Message */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageSquare className="w-6 h-6" />
              <span>Personal Message</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Inspirational Prompt */}
            <div className="mb-6 p-4 bg-primary/5 border-l-4 border-primary rounded-r-lg">
              <p className="text-sm text-foreground leading-relaxed">
                <strong className="text-primary">💡 Make it Meaningful:</strong> Every contribution is a chance to plant wisdom alongside wealth. 
                Consider adding a video or written message that sparks curiosity, excitement, and long-term thinking. 
                Whether it's a quote about patience, a story about your first investment, a lesson you learned along your financial journey, 
                or a reminder that money can be a tool for freedom, your words will help shape how this child sees their financial future. 
                Let your message be a compass they carry for years to come.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Video Message (Optional)
                </label>
                <VideoRecorder onVideoRecorded={setVideoUrl} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Written Message
                </label>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={`Write a personal message for ${typedChild.name}...`}
                  rows={8}
                  className="resize-none"
                  data-testid="textarea-message"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recurring Contribution Setup */}
        {!giftSent && selectedInvestment && giftGiverName && (
          <RecurringContributionSetup
            childId={typedChild.id}
            childName={typedChild.name}
            selectedInvestment={selectedInvestment}
            amount={amount}
            contributorName={giftGiverName}
            contributorEmail={giftGiverEmail}
          />
        )}

        {/* Payment */}
        {showPayment && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="w-6 h-6" />
                <span>Payment</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <MockPaymentForm
                amount={parseFloat(amount)}
                giftGiverName={giftGiverName}
                onPaymentSuccess={handlePaymentSuccess}
                onPaymentError={handlePaymentError}
                disabled={sendGiftMutation.isPending}
              />
            </CardContent>
          </Card>
        )}

        {/* Send Gift */}
        <Card className="bg-muted">
          <CardContent className="p-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-foreground">Gift Summary</h3>
                <p className="text-muted-foreground">
                  ${amount} → {estimatedShares} shares of{" "}
                  {selectedInvestment?.name || "Select an investment"}
                </p>
                <p className="text-muted-foreground">To: {typedChild.name}</p>
                {paymentId && (
                  <p className="text-success text-sm mt-2">✓ Payment confirmed: {paymentId}</p>
                )}
              </div>
              <Button
                onClick={handleSendGift}
                disabled={!selectedInvestment || !giftGiverName || sendGiftMutation.isPending || giftSent}
                className={`px-8 py-4 h-auto text-lg font-bold ${
                  giftSent 
                    ? "bg-success text-success-foreground" 
                    : "bg-gradient-to-r from-primary to-accent text-white"
                }`}
                data-testid="button-send-gift"
              >
                <Gift className="w-5 h-5 mr-2" />
                {sendGiftMutation.isPending 
                  ? "Sending..." 
                  : giftSent 
                    ? "Gift Sent Successfully!" 
                    : paymentId 
                      ? "Complete Gift" 
                      : "Review & Pay"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
