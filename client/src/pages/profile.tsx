import MobileLayout from "@/components/mobile-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Settings, HelpCircle, Shield, LogOut, Edit3, Camera, Upload, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

export default function Profile() {
  const { user, logout, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: user?.name || '',
    bankAccountNumber: user?.bankAccountNumber || '',
    profileImageUrl: user?.profileImageUrl || '',
  });
  const [isLoading, setIsLoading] = useState(false);
  
  // Camera functionality state
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraMode, setCameraMode] = useState<'url' | 'camera'>('url');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Fetch real data for account overview
  const { data: children = [] } = useQuery<any[]>({
    queryKey: ["/api/children", user?.id],
    enabled: !!user?.id,
  });

  // Calculate total portfolio value across all children
  const totalPortfolioValue = children.reduce((sum: number, child: any) => {
    return sum + (child.totalValue || 0);
  }, 0);

  const handleLogout = () => {
    logout();
  };

  const handleEditSubmit = async () => {
    // Validate that we have image data if we're in camera mode
    if (capturedImage && !editData.profileImageUrl) {
      alert('Image data is missing. Please try capturing again.');
      return;
    }
    
    setIsLoading(true);
    try {
      console.log('Updating profile with data:', {
        ...editData,
        profileImageUrl: editData.profileImageUrl ? `[Base64 data, length: ${editData.profileImageUrl.length}]` : 'null'
      });
      
      await updateProfile(editData);
      setIsEditing(false);
      setIsCameraOpen(false); // Close camera dialog on success
      setCapturedImage(null); // Clear captured image
      setCameraMode('url'); // Reset to URL mode
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert(`Failed to update profile: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditChange = (field: string, value: string) => {
    setEditData(prev => ({
      ...prev,
      [field]: value
    }));
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
      alert('Unable to access camera. Please check permissions.');
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
        console.log('Photo captured, data URL length:', imageDataUrl.length);
        setCapturedImage(imageDataUrl);
        setEditData(prev => ({ ...prev, profileImageUrl: imageDataUrl }));
        stopCamera();
        // Don't close dialog immediately - let user see preview and decide
      }
    } else {
      console.error('Video or canvas ref not available');
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    setEditData(prev => ({ ...prev, profileImageUrl: '' }));
    startCamera();
  };

  const switchToUrlMode = () => {
    stopCamera();
    setCameraMode('url');
  };

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const handleSettings = () => {
    alert("Settings functionality would be implemented here");
  };

  const handleHelp = () => {
    alert("Help functionality would be implemented here");
  };

  const handleSecurity = () => {
    alert("Security settings would be implemented here");
  };

  return (
    <MobileLayout currentTab="profile">
      <div className="space-y-6">
        {/* Profile Header */}
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="relative inline-block">
              <Avatar className="w-24 h-24 mx-auto mb-4">
                {user?.profileImageUrl ? (
                  <img src={user.profileImageUrl} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <AvatarFallback className="text-2xl">
                    {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                  </AvatarFallback>
                )}
              </Avatar>
              <Dialog open={isCameraOpen} onOpenChange={setIsCameraOpen}>
                <DialogTrigger asChild>
                  <Button
                    size="sm"
                    className="absolute bottom-2 right-2 rounded-full w-8 h-8 p-0"
                    variant="secondary"
                    onClick={() => setIsCameraOpen(true)}
                  >
                    <Camera className="w-4 h-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Update Profile Picture</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    {/* Mode Selection */}
                    {!capturedImage && cameraMode === 'url' && (
                      <div className="flex space-x-2 mb-4">
                        <Button
                          variant={cameraMode === 'url' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setCameraMode('url')}
                          className="flex-1"
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          URL
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={startCamera}
                          className="flex-1"
                        >
                          <Camera className="w-4 h-4 mr-2" />
                          Camera
                        </Button>
                      </div>
                    )}

                    {/* URL Input Mode */}
                    {cameraMode === 'url' && !capturedImage && (
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="profileImageUrl">Image URL</Label>
                          <Input
                            id="profileImageUrl"
                            value={editData.profileImageUrl}
                            onChange={(e) => handleEditChange('profileImageUrl', e.target.value)}
                            placeholder="Enter image URL"
                          />
                        </div>
                        <Button onClick={handleEditSubmit} disabled={isLoading} className="w-full">
                          {isLoading ? 'Updating...' : 'Update Picture'}
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
                          <Button onClick={handleEditSubmit} disabled={isLoading} className="flex-1">
                            {isLoading ? 'Updating...' : 'Use This Photo'}
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
            <h2 className="text-2xl font-bold mb-2">{user?.name || 'User'}</h2>
            <p className="text-muted-foreground">Parent Account</p>
            <p className="text-sm text-muted-foreground">{user?.email || 'user@email.com'}</p>
            {user?.bankAccountNumber && (
              <p className="text-sm text-muted-foreground mt-1">
                Bank Account: {user.bankAccountNumber}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Account Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Account Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-primary">{children.length}</p>
                <p className="text-sm text-muted-foreground">Children</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-success">${totalPortfolioValue.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Total Portfolio</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Menu Options */}
        <div className="space-y-2">
          <Dialog open={isEditing} onOpenChange={setIsEditing}>
            <DialogTrigger asChild>
              <Button 
                variant="ghost" 
                className="w-full justify-start"
                data-testid="button-edit-profile"
              >
                <Edit3 className="w-5 h-5 mr-3" />
                Edit Profile
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Profile</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-name">Full Name</Label>
                  <Input
                    id="edit-name"
                    value={editData.name}
                    onChange={(e) => handleEditChange('name', e.target.value)}
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-bank">Bank Account Number</Label>
                  <Input
                    id="edit-bank"
                    value={editData.bankAccountNumber}
                    onChange={(e) => handleEditChange('bankAccountNumber', e.target.value)}
                    placeholder="Enter bank account number"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleEditSubmit} disabled={isLoading} className="flex-1">
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)} className="flex-1">
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Button 
            variant="ghost" 
            className="w-full justify-start"
            onClick={handleSettings}
            data-testid="button-settings"
          >
            <Settings className="w-5 h-5 mr-3" />
            Account Settings
          </Button>
          
          <Button 
            variant="ghost" 
            className="w-full justify-start"
            onClick={handleSecurity}
            data-testid="button-security"
          >
            <Shield className="w-5 h-5 mr-3" />
            Security & Privacy
          </Button>
          
          <Button 
            variant="ghost" 
            className="w-full justify-start"
            onClick={handleHelp}
            data-testid="button-help"
          >
            <HelpCircle className="w-5 h-5 mr-3" />
            Help & Support
          </Button>
        </div>

        {/* App Info */}
        <Card>
          <CardContent className="pt-6 text-center">
            <h3 className="font-bold text-lg mb-2">StockSprout</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Growing their future, one gift at a time
            </p>
            <p className="text-xs text-muted-foreground">Version 1.0.0</p>
          </CardContent>
        </Card>

        {/* Logout */}
        <Button 
          variant="outline" 
          className="w-full"
          onClick={handleLogout}
          data-testid="button-logout"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Sign Out
        </Button>
      </div>
    </MobileLayout>
  );
}
