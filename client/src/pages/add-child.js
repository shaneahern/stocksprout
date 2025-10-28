import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, UserPlus, Camera } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { apiRequest, queryClient } from "@/lib/queryClient";
import TakePhotoModal from "@/components/take-photo-modal";
import PhotoEditorModal from "@/components/photo-editor-modal";
export default function AddChild() {
    const [, setLocation] = useLocation();
    const { toast } = useToast();
    const { user } = useAuth();
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [birthdate, setBirthdate] = useState("");
    const [profileImageUrl, setProfileImageUrl] = useState("");
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [isPhotoEditorOpen, setIsPhotoEditorOpen] = useState(false);
    const [tempImageUrl, setTempImageUrl] = useState("");
    const fileInputRef = useRef(null);
    const addChildMutation = useMutation({
        mutationFn: async (childData) => {
            const response = await apiRequest("POST", "/api/children", childData);
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/children"] });
            toast({
                title: "Child Added Successfully!",
                description: "You can now create gift links for this child.",
            });
            setLocation("/");
        },
        onError: (error) => {
            toast({
                title: "Error Adding Child",
                description: error?.message || "Please try again later.",
                variant: "destructive",
            });
        },
    });
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!firstName || !lastName || !birthdate) {
            toast({
                title: "Missing Information",
                description: "Please fill in all required fields.",
                variant: "destructive",
            });
            return;
        }
        if (!user?.id) {
            toast({
                title: "Authentication Error",
                description: "Please log in to add a child.",
                variant: "destructive",
            });
            return;
        }
        const childData = {
            parentId: user.id,
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            birthdate: new Date(birthdate).toISOString(),
            ...(profileImageUrl && { profileImageUrl }),
        };
        addChildMutation.mutate(childData);
    };
    const handleBack = () => {
        setLocation("/");
    };
    const handlePhotoTaken = (photoDataUrl) => {
        setTempImageUrl(photoDataUrl);
        setIsCameraOpen(false);
        setIsPhotoEditorOpen(true);
    };
    const handleGallerySelect = (e) => {
        const file = e.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const result = event.target?.result;
                setTempImageUrl(result);
                setIsPhotoEditorOpen(true);
            };
            reader.readAsDataURL(file);
        }
    };
    const handlePhotoEdited = (croppedImageUrl) => {
        setProfileImageUrl(croppedImageUrl);
        setIsPhotoEditorOpen(false);
        setTempImageUrl("");
    };
    return (_jsx("div", { className: "min-h-screen bg-background p-4", children: _jsxs("div", { className: "max-w-md mx-auto pt-8", children: [_jsxs("div", { className: "flex items-center space-x-4 mb-6", children: [_jsx(Button, { variant: "ghost", size: "sm", onClick: handleBack, "data-testid": "button-back", children: _jsx(ArrowLeft, { className: "w-4 h-4" }) }), _jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold", children: "Add Child" }), _jsx("p", { className: "text-muted-foreground", children: "Create a new investment account" })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center space-x-2", children: [_jsx(UserPlus, { className: "w-6 h-6" }), _jsx("span", { children: "Child Information" })] }) }), _jsx(CardContent, { children: _jsxs("form", { onSubmit: handleSubmit, className: "space-y-6", children: [_jsxs("div", { className: "flex flex-col items-center gap-4 p-4 bg-muted rounded-xl", children: [_jsx(Avatar, { className: "w-24 h-24", children: profileImageUrl ? (_jsx("img", { src: profileImageUrl, alt: "Child profile", className: "w-full h-full object-cover" })) : (_jsx(AvatarFallback, { className: "text-2xl bg-primary/10", children: firstName ? firstName.charAt(0).toUpperCase() : _jsx(UserPlus, { className: "w-12 h-12 text-muted-foreground" }) })) }), _jsxs(Button, { type: "button", size: "sm", variant: "outline", onClick: () => fileInputRef.current?.click(), children: [_jsx(Camera, { className: "w-4 h-4 mr-2" }), "Add Photo"] }), _jsx("input", { ref: fileInputRef, type: "file", accept: "image/*", onChange: handleGallerySelect, className: "hidden" }), _jsx("p", { className: "text-sm text-muted-foreground text-center", children: "Add a profile photo for your child (optional)" })] }), _jsx(TakePhotoModal, { isOpen: isCameraOpen, onClose: () => setIsCameraOpen(false), onPhotoTaken: handlePhotoTaken, title: "Add Child's Profile Photo" }), _jsx(PhotoEditorModal, { isOpen: isPhotoEditorOpen, onClose: () => {
                                            setIsPhotoEditorOpen(false);
                                            setTempImageUrl("");
                                        }, imageUrl: tempImageUrl, onSave: handlePhotoEdited, title: "Edit Profile Photo" }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "firstName", children: "First Name *" }), _jsx(Input, { id: "firstName", value: firstName, onChange: (e) => setFirstName(e.target.value), placeholder: "Enter first name", "data-testid": "input-child-first-name" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "lastName", children: "Last Name *" }), _jsx(Input, { id: "lastName", value: lastName, onChange: (e) => setLastName(e.target.value), placeholder: "Enter last name", "data-testid": "input-child-last-name" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "birthdate", children: "Date of Birth *" }), _jsx(Input, { id: "birthdate", type: "date", value: birthdate, onChange: (e) => setBirthdate(e.target.value), max: new Date().toISOString().split('T')[0], "data-testid": "input-child-birthdate" })] }), _jsx("div", { className: "pt-4", children: _jsx(Button, { type: "submit", className: "w-full", disabled: addChildMutation.isPending, "data-testid": "button-add-child", children: addChildMutation.isPending ? "Adding..." : "Add Child" }) })] }) })] }), _jsx(Card, { className: "mt-6", children: _jsxs(CardContent, { className: "pt-6", children: [_jsx("h3", { className: "font-semibold mb-2", children: "What happens next?" }), _jsxs("ul", { className: "text-sm text-muted-foreground space-y-1", children: [_jsx("li", { children: "\u2022 A unique gift link will be generated" }), _jsx("li", { children: "\u2022 Share the link with family and friends" }), _jsx("li", { children: "\u2022 They can send investment gifts directly" }), _jsx("li", { children: "\u2022 Track all gifts in the portfolio" })] })] }) })] }) }));
}
