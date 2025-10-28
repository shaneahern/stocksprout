import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import MobileLayout from "@/components/mobile-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Settings, HelpCircle, Shield, LogOut, Edit3, Camera } from "lucide-react";
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
    const [capturedImage, setCapturedImage] = useState(null);
    const [isPhotoEditorOpen, setIsPhotoEditorOpen] = useState(false);
    const [tempImageUrl, setTempImageUrl] = useState("");
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);
    const fileInputRef = useRef(null);
    // Fetch user's own children (as custodian)
    const { data: children = [] } = useQuery({
        queryKey: ["/api/children", user?.id],
        enabled: !!user?.id,
    });
    // Fetch children the user has contributed to
    const { data: contributorGifts = [] } = useQuery({
        queryKey: ["/api/contributors/gifts", user?.id],
        queryFn: async () => {
            if (!user?.id || !token)
                return [];
            const response = await fetch(`/api/contributors/${user.id}/gifts`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            if (!response.ok)
                return [];
            return response.json();
        },
        enabled: !!user?.id && !!token,
    });
    // Extract unique children from contributor gifts (excluding own children)
    const contributedChildren = contributorGifts.reduce((acc, gift) => {
        if (gift.child && !acc.find((c) => c.id === gift.child.id)) {
            // Only include if this is not one of the user's own children
            const isOwnChild = children.some((child) => child.id === gift.child.id);
            if (!isOwnChild) {
                acc.push(gift.child);
            }
        }
        return acc;
    }, []);
    // Calculate total portfolio value for own children
    const ownChildrenPortfolioValue = children.reduce((sum, child) => {
        return sum + (child.totalValue || 0);
    }, 0);
    // Calculate total contributed amount (only to other children, not own)
    const totalContributedAmount = contributorGifts
        .filter((gift) => {
        const isOwnChild = children.some((child) => child.id === gift.childId);
        return gift.status === 'approved' && !isOwnChild;
    })
        .reduce((sum, gift) => {
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
        }
        catch (error) {
            console.error('Failed to update profile:', error);
            alert(`Failed to update profile: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
        finally {
            setIsLoading(false);
        }
    };
    const handleEditChange = (field, value) => {
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
        }
        catch (error) {
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
        }
        else {
            console.error('Video or canvas ref not available');
        }
    };
    const retakePhoto = () => {
        setCapturedImage(null);
        setEditData(prev => ({ ...prev, profileImageUrl: '' }));
        setIsCameraOpen(true);
        startCamera();
    };
    const handleGallerySelect = (e) => {
        const file = e.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const result = event.target?.result;
                console.log('Gallery photo selected, data URL length:', result.length);
                setTempImageUrl(result);
                setIsCameraOpen(false);
                setIsPhotoEditorOpen(true);
                stopCamera();
            };
            reader.readAsDataURL(file);
        }
    };
    const handlePhotoEdited = async (croppedImageUrl) => {
        setIsPhotoEditorOpen(false);
        setTempImageUrl("");
        setIsCameraOpen(false);
        // Save to backend using updateProfile from AuthContext
        setIsLoading(true);
        try {
            await updateProfile({ profileImageUrl: croppedImageUrl });
        }
        catch (error) {
            console.error('Profile update error:', error);
        }
        finally {
            setIsLoading(false);
        }
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
    return (_jsx(MobileLayout, { currentTab: "profile", children: _jsxs("div", { className: "space-y-3 pb-16", children: [_jsx(Card, { children: _jsxs(CardContent, { className: "pt-3 pb-3 text-center", children: [_jsxs("div", { className: "relative inline-block", children: [_jsx(Avatar, { className: "w-32 h-32 mx-auto mb-3", children: user?.profileImageUrl ? (_jsx("img", { src: user.profileImageUrl, alt: "Profile", className: "w-full h-full object-cover" })) : (_jsx(AvatarFallback, { className: "text-3xl", children: user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U' })) }), _jsx(Button, { size: "sm", className: "absolute bottom-2 right-2 rounded-full w-10 h-10 p-0 bg-blue-500 hover:bg-blue-600 border-2 border-white", variant: "default", onClick: () => fileInputRef.current?.click(), children: _jsx(Camera, { className: "w-4 h-4 text-white" }) }), _jsx("input", { ref: fileInputRef, type: "file", accept: "image/*", onChange: handleGallerySelect, className: "hidden" }), _jsx(Dialog, { open: isCameraOpen, onOpenChange: (open) => {
                                            setIsCameraOpen(open);
                                            if (!open) {
                                                stopCamera();
                                                setCapturedImage(null);
                                            }
                                        }, children: _jsxs(DialogContent, { className: "max-w-md", children: [_jsx(DialogHeader, { children: _jsx(DialogTitle, { children: "Take Photo" }) }), _jsxs("div", { className: "space-y-4", children: [_jsx("div", { className: "relative", children: _jsx("video", { ref: videoRef, autoPlay: true, playsInline: true, muted: true, className: "w-full h-64 object-cover rounded-lg bg-gray-100" }) }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { variant: "outline", onClick: () => setIsCameraOpen(false), className: "flex-1", children: "Cancel" }), _jsxs(Button, { onClick: capturePhoto, className: "flex-1 bg-green-700 hover:bg-green-800", children: [_jsx(Camera, { className: "w-4 h-4 mr-2" }), "Capture"] })] }), _jsx("canvas", { ref: canvasRef, className: "hidden" })] })] }) })] }), _jsx("h2", { className: "text-2xl font-bold mb-1", children: user?.name || 'User' }), _jsx("p", { className: "text-sm text-muted-foreground", children: user?.email || 'user@email.com' })] }) }), _jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { children: "Account Overview" }) }), _jsx(CardContent, { className: "pt-2 pb-4", children: _jsxs("div", { className: "grid grid-cols-3 gap-6 text-center", children: [_jsxs("div", { children: [_jsx("p", { className: "text-3xl font-bold", style: { color: '#265FDC' }, children: children.length }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Your Children / Sprouts" })] }), _jsxs("div", { children: [_jsx("p", { className: "text-3xl font-bold", style: { color: '#265FDC' }, children: contributedChildren.length }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Children / Sprouts You've Helped" })] }), _jsxs("div", { children: [_jsx("p", { className: "text-3xl font-bold", style: { color: '#265FDC' }, children: "1" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Months on StockSprout" })] })] }) })] }), _jsxs("div", { className: "space-y-0", children: [_jsxs(Button, { variant: "ghost", className: "w-full justify-start h-12 px-4 text-base", onClick: () => setIsEditing(true), "data-testid": "button-edit-profile", children: [_jsx(Edit3, { className: "w-7 h-7 mr-4" }), "Edit Profile"] }), _jsx(Dialog, { open: isEditing, onOpenChange: setIsEditing, children: _jsxs(DialogContent, { children: [_jsx(DialogHeader, { children: _jsx(DialogTitle, { children: "Edit Profile" }) }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "edit-name", children: "Full Name" }), _jsx(Input, { id: "edit-name", value: editData.name, onChange: (e) => handleEditChange('name', e.target.value), placeholder: "Enter your full name" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "edit-bank", children: "Bank Account Number" }), _jsx(Input, { id: "edit-bank", value: editData.bankAccountNumber, onChange: (e) => handleEditChange('bankAccountNumber', e.target.value), placeholder: "Enter bank account number" })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { onClick: handleEditSubmit, disabled: isLoading, className: "flex-1", children: isLoading ? 'Saving...' : 'Save Changes' }), _jsx(Button, { variant: "outline", onClick: () => setIsEditing(false), className: "flex-1", children: "Cancel" })] })] })] }) }), _jsxs(Button, { variant: "ghost", className: "w-full justify-start h-12 px-4 text-base", onClick: handleSettings, "data-testid": "button-settings", children: [_jsx(Settings, { className: "w-7 h-7 mr-4" }), "Account Settings"] }), _jsxs(Button, { variant: "ghost", className: "w-full justify-start h-12 px-4 text-base", onClick: handleSecurity, "data-testid": "button-security", children: [_jsx(Shield, { className: "w-7 h-7 mr-4" }), "Security & Privacy"] }), _jsxs(Button, { variant: "ghost", className: "w-full justify-start h-12 px-4 text-base", onClick: handleHelp, "data-testid": "button-help", children: [_jsx(HelpCircle, { className: "w-7 h-7 mr-4" }), "Help & Support"] })] }), _jsxs(Button, { variant: "outline", className: "w-full bg-gray-100 hover:bg-gray-200 border-gray-300 mb-16 px-6 py-3 text-base", onClick: handleLogout, "data-testid": "button-logout", children: [_jsx(LogOut, { className: "w-7 h-7 mr-3" }), "Sign Out"] }), _jsx(PhotoEditorModal, { isOpen: isPhotoEditorOpen, onClose: () => {
                        setIsPhotoEditorOpen(false);
                        setTempImageUrl("");
                    }, imageUrl: tempImageUrl, onSave: handlePhotoEdited, title: "Edit Profile Photo" })] }) }));
}
