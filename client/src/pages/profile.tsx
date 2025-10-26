import MobileLayout from "@/components/mobile-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Settings, HelpCircle, Shield, LogOut, Edit3, Camera, Image } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import PhotoEditorModal from "@/components/photo-editor-modal";

export default function Profile() {
  const { user, token, logout, updateProfile } = useAuth();
  const [, setLocation] = useLocation();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: '',
    bankAccountNumber: '',
    profileImageUrl: '',
  });

  // Update editData when user changes
  useEffect(() => {
    if (user) {
      setEditData({
        name: user.name || '',
        bankAccountNumber: user.bankAccountNumber || '',
        profileImageUrl: user.profileImageUrl || '',
      });
    }
  }, [user]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Camera functionality state
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isPhotoEditorOpen, setIsPhotoEditorOpen] = useState(false);
  const [tempImageUrl, setTempImageUrl] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch user's own children (as custodian)
  const { data: children = [] } = useQuery<any[]>({
    queryKey: ["/api/children", user?.id],
    enabled: !!user?.id,
  });

  // Fetch children the user has contributed to
  const { data: contributorGifts = [] } = useQuery<any[]>({
    queryKey: ["/api/contributors/gifts", user?.id],
    queryFn: async () => {
      if (!user?.id || !token) return [];
      
      const response = await fetch(`/api/contributors/${user.id}/gifts`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) return [];
      return response.json();
    },
    enabled: !!user?.id && !!token,
  });

  // Extract unique children from contributor gifts (excluding own children)
  const contributedChildren = contributorGifts.reduce((acc: any[], gift: any) => {
    if (gift.child && !acc.find((c: any) => c.id === gift.child.id)) {
      // Only include if this is not one of the user's own children
      const isOwnChild = children.some((child: any) => child.id === gift.child.id);
      if (!isOwnChild) {
        acc.push(gift.child);
      }
    }
    return acc;
  }, []);

  // Calculate total portfolio value for own children
  const ownChildrenPortfolioValue = children.reduce((sum: number, child: any) => {
    return sum + (child.totalValue || 0);
  }, 0);

  // Calculate total contributed amount (only to other children, not own)
  const totalContributedAmount = contributorGifts
    .filter((gift: any) => {
      const isOwnChild = children.some((child: any) => child.id === gift.childId);
      return gift.status === 'approved' && !isOwnChild;
    })
    .reduce((sum: number, gift: any) => {
      return sum + parseFloat(gift.amount || "0");
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
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Unable to access camera. Please check permissions and try again.');
      setIsCameraOpen(false);
    }
  };

  // Auto-start camera when dialog opens
  useEffect(() => {
    if (isCameraOpen && !capturedImage) {
      startCamera();
    }
  }, [isCameraOpen]);

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
        setTempImageUrl(imageDataUrl);
        setIsCameraOpen(false);
        setIsPhotoEditorOpen(true);
        stopCamera();
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

  const handleGallerySelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        console.log('Gallery photo selected, data URL length:', result.length);
        setTempImageUrl(result);
        setIsCameraOpen(false);
        setIsPhotoEditorOpen(true);
        stopCamera();
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePhotoEdited = (croppedImageUrl: string) => {
    setCapturedImage(croppedImageUrl);
    setEditData(prev => ({ ...prev, profileImageUrl: croppedImageUrl }));
    setIsPhotoEditorOpen(false);
    setTempImageUrl("");
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
    setLocation("/privacy-policy");
  };

  return (
    <MobileLayout currentTab="profile">
      <div className="space-y-3 pb-16">
        {/* Profile Header */}
        <Card>
          <CardContent className="pt-3 pb-3 text-center">
            <div className="relative inline-block">
              <Avatar className="w-32 h-32 mx-auto mb-3">
                {user?.profileImageUrl ? (
                  <img src={user.profileImageUrl} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <AvatarFallback className="text-3xl">
                    {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                  </AvatarFallback>
                )}
              </Avatar>
              <Dialog open={isCameraOpen} onOpenChange={(open) => {
                setIsCameraOpen(open);
                if (!open) {
                  stopCamera();
                  setCapturedImage(null);
                }
              }}>
                <DialogTrigger asChild>
                  <Button
                    size="sm"
                    className="absolute bottom-2 right-2 rounded-full w-10 h-10 p-0 bg-blue-500 hover:bg-blue-600 border-2 border-white"
                    variant="default"
                    onClick={() => setIsCameraOpen(true)}
                  >
                    <Camera className="w-4 h-4 text-white" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Update Profile Picture</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    {/* Camera View */}
                    {!capturedImage && (
                      <div className="space-y-4">
                        <div className="relative">
                          <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="w-full h-64 object-cover rounded-lg bg-gray-100"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            onClick={() => setIsCameraOpen(false)} 
                            className="flex-1"
                          >
                            Cancel
                          </Button>
                          <Button 
                            onClick={() => fileInputRef.current?.click()} 
                            variant="outline"
                            className="flex-1"
                          >
                            <Image className="w-4 h-4 mr-2" />
                            Choose Photo
                          </Button>
                          <Button 
                            onClick={capturePhoto} 
                            className="flex-1 bg-green-700 hover:bg-green-800"
                          >
                            <Camera className="w-4 h-4 mr-2" />
                            Take Photo
                          </Button>
                        </div>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleGallerySelect}
                          className="hidden"
                        />
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
                          <Button variant="outline" onClick={retakePhoto} className="flex-1">
                            Retake
                          </Button>
                          <Button onClick={handleEditSubmit} disabled={isLoading} className="flex-1 bg-green-700 hover:bg-green-800">
                            {isLoading ? 'Updating...' : 'Use This Photo'}
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
            <h2 className="text-2xl font-bold mb-1">{user?.name || 'User'}</h2>
            <p className="text-sm text-muted-foreground">{user?.email || 'user@email.com'}</p>
          </CardContent>
        </Card>

        {/* Account Overview */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Account Overview</CardTitle>
          </CardHeader>
          <CardContent className="pt-2 pb-4">
            <div className="grid grid-cols-3 gap-6 text-center">
              <div>
                <p className="text-3xl font-bold" style={{ color: '#265FDC' }}>{children.length}</p>
                <p className="text-sm text-muted-foreground">Your Children / Sprouts</p>
              </div>
              <div>
                <p className="text-3xl font-bold" style={{ color: '#265FDC' }}>{contributedChildren.length}</p>
                <p className="text-sm text-muted-foreground">Children / Sprouts You've Helped</p>
              </div>
              <div>
                <p className="text-3xl font-bold" style={{ color: '#265FDC' }}>1</p>
                <p className="text-sm text-muted-foreground">Months on StockSprout</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Settings Options */}
        <div className="space-y-0">
          <Dialog open={isEditing} onOpenChange={setIsEditing}>
            <DialogTrigger asChild>
              <Button 
                variant="ghost" 
                className="w-full justify-start h-12 px-4 text-base"
                data-testid="button-edit-profile"
              >
                <Edit3 className="w-7 h-7 mr-4" />
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
            className="w-full justify-start h-12 px-4 text-base"
            onClick={handleSettings}
            data-testid="button-settings"
          >
            <Settings className="w-7 h-7 mr-4" />
            Account Settings
          </Button>
          
          <Button 
            variant="ghost" 
            className="w-full justify-start h-12 px-4 text-base"
            onClick={handleSecurity}
            data-testid="button-security"
          >
            <Shield className="w-7 h-7 mr-4" />
            Security & Privacy
          </Button>
          
          <Button 
            variant="ghost" 
            className="w-full justify-start h-12 px-4 text-base"
            onClick={handleHelp}
            data-testid="button-help"
          >
            <HelpCircle className="w-7 h-7 mr-4" />
            Help & Support
          </Button>
        </div>


        {/* Sign Out */}
        <Button 
          variant="outline" 
          className="w-full bg-gray-100 hover:bg-gray-200 border-gray-300 mb-16 px-6 py-3 text-base"
          onClick={handleLogout}
          data-testid="button-logout"
        >
          <LogOut className="w-7 h-7 mr-3" />
          Sign Out
        </Button>

        {/* Photo Editor Modal */}
        <PhotoEditorModal
          isOpen={isPhotoEditorOpen}
          onClose={() => {
            setIsPhotoEditorOpen(false);
            setTempImageUrl("");
          }}
          imageUrl={tempImageUrl}
          onSave={handlePhotoEdited}
          title="Edit Profile Photo"
        />
      </div>
    </MobileLayout>
  );
}
