import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Video, Square, X, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
// Detect if device is mobile
const isMobileDevice = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
        (typeof window !== 'undefined' && window.innerWidth <= 768);
};
export default function VideoRecorder({ onVideoRecorded, videoUrl }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [posterUrl, setPosterUrl] = useState(null);
    const videoRef = useRef(null);
    const previewVideoRef = useRef(null);
    const streamRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const chunksRef = useRef([]);
    const fileInputRef = useRef(null);
    const { toast } = useToast();
    // Detect mobile on mount
    useEffect(() => {
        setIsMobile(isMobileDevice());
    }, []);
    // Reset poster when videoUrl changes
    useEffect(() => {
        if (videoUrl) {
            setPosterUrl(null);
        }
    }, [videoUrl]);
    // ========== Native Camera (Mobile) ==========
    const handleVideoSelect = async (event) => {
        const file = event.target.files?.[0];
        if (!file)
            return;
        // Validate it's a video file
        if (!file.type.startsWith('video/')) {
            toast({
                title: "Invalid File",
                description: "Please select a video file.",
                variant: "destructive",
            });
            return;
        }
        // Automatically upload the video
        await uploadVideo(file);
        // Reset the input so the same file can be selected again
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };
    const handleNativeCameraClick = () => {
        fileInputRef.current?.click();
    };
    // ========== Web-Based Recording (Desktop) ==========
    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'user', // Front-facing camera (selfie mode)
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                },
                audio: true
            });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        }
        catch (error) {
            toast({
                title: "Camera Error",
                description: "Could not access camera. Please check permissions.",
                variant: "destructive",
            });
            setIsModalOpen(false);
        }
    };
    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
    };
    const startRecording = () => {
        if (!streamRef.current) {
            toast({
                title: "Camera Not Ready",
                description: "Please wait for the camera to initialize.",
                variant: "destructive",
            });
            return;
        }
        try {
            // Detect supported MIME type for mobile compatibility
            let mimeType = 'video/webm;codecs=vp8,opus';
            if (MediaRecorder.isTypeSupported('video/mp4')) {
                mimeType = 'video/mp4';
            }
            else if (MediaRecorder.isTypeSupported('video/webm;codecs=h264')) {
                mimeType = 'video/webm;codecs=h264';
            }
            else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
                mimeType = 'video/webm;codecs=vp9';
            }
            else if (MediaRecorder.isTypeSupported('video/webm')) {
                mimeType = 'video/webm';
            }
            mediaRecorderRef.current = new MediaRecorder(streamRef.current, { mimeType });
            chunksRef.current = [];
            mediaRecorderRef.current.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    chunksRef.current.push(event.data);
                }
            };
            mediaRecorderRef.current.onstop = async () => {
                const finalType = chunksRef.current[0]?.type || mediaRecorderRef.current?.mimeType || '';
                const blob = new Blob(chunksRef.current, { type: finalType });
                // Stop camera stream
                stopCamera();
                // Automatically upload the video
                await uploadVideo(blob);
            };
            mediaRecorderRef.current.start(100);
            setIsRecording(true);
            toast({
                title: "Recording Started",
                description: "Recording your video message...",
            });
        }
        catch (error) {
            console.error('Video recording error:', error);
            toast({
                title: "Recording Failed",
                description: "Failed to start recording. Please try again.",
                variant: "destructive",
            });
        }
    };
    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };
    const handleModalOpen = () => {
        setIsModalOpen(true);
    };
    const handleClose = () => {
        // Stop recording if in progress
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
        }
        stopCamera();
        setIsRecording(false);
        setIsModalOpen(false);
    };
    // Start camera when dialog opens (desktop only)
    useEffect(() => {
        if (isModalOpen && !isUploading && !isMobile) {
            startCamera();
        }
        return () => {
            stopCamera();
        };
    }, [isModalOpen, isMobile]);
    // ========== Upload Function (shared) ==========
    const uploadVideo = async (fileOrBlob) => {
        setIsUploading(true);
        try {
            // Create form data with the video file
            const formData = new FormData();
            // Determine filename and extension based on file type and MIME type
            let filename = `video-${Date.now()}`;
            let mimeType = fileOrBlob.type;
            if (fileOrBlob instanceof File) {
                // Use the original filename if it exists and has an extension
                const originalName = fileOrBlob.name;
                const hasExtension = originalName.includes('.');
                if (hasExtension) {
                    // Keep the original filename
                    filename = originalName;
                }
                else {
                    // No extension in original name, infer from MIME type or default to mp4
                    if (mimeType) {
                        if (mimeType.includes('mp4') || mimeType.includes('quicktime')) {
                            filename = `${filename}.mp4`;
                        }
                        else if (mimeType.includes('webm')) {
                            filename = `${filename}.webm`;
                        }
                        else if (mimeType.includes('mov')) {
                            filename = `${filename}.mov`;
                        }
                        else {
                            // Default to mp4 for mobile videos (common format)
                            filename = `${filename}.mp4`;
                            mimeType = 'video/mp4';
                        }
                    }
                    else {
                        // No MIME type, default to mp4 (common for mobile)
                        filename = `${filename}.mp4`;
                        mimeType = 'video/mp4';
                    }
                }
                // Ensure MIME type is set if missing
                if (!mimeType) {
                    // Try to infer from filename extension
                    const ext = originalName.toLowerCase().split('.').pop();
                    if (ext === 'mp4')
                        mimeType = 'video/mp4';
                    else if (ext === 'webm')
                        mimeType = 'video/webm';
                    else if (ext === 'mov')
                        mimeType = 'video/quicktime';
                    else
                        mimeType = 'video/mp4'; // Default
                }
            }
            else {
                // Blob from MediaRecorder
                if (mimeType.includes('mp4')) {
                    filename = `${filename}.mp4`;
                }
                else if (mimeType.includes('webm')) {
                    filename = `${filename}.webm`;
                }
                else {
                    filename = `${filename}.webm`;
                    mimeType = 'video/webm';
                }
            }
            // Create a new File from Blob with proper MIME type if needed
            let fileToUpload = fileOrBlob;
            if (fileOrBlob instanceof Blob && !(fileOrBlob instanceof File)) {
                // Convert Blob to File with proper name and MIME type
                fileToUpload = new File([fileOrBlob], filename, { type: mimeType || 'video/mp4' });
            }
            else if (fileOrBlob instanceof File && !fileOrBlob.type) {
                // If File has no MIME type, create a new one with MIME type
                fileToUpload = new File([fileOrBlob], filename, { type: mimeType || 'video/mp4' });
            }
            formData.append('video', fileToUpload, filename);
            // Upload to server
            const uploadResponse = await fetch('/api/upload-video', {
                method: 'POST',
                body: formData,
            });
            if (!uploadResponse.ok) {
                const errorData = await uploadResponse.json().catch(() => ({ error: 'Upload failed' }));
                throw new Error(errorData.error || `Upload failed: ${uploadResponse.status} ${uploadResponse.statusText}`);
            }
            const data = await uploadResponse.json();
            setPosterUrl(null); // Reset poster to regenerate thumbnail for new video
            onVideoRecorded(data.videoUrl);
            setIsModalOpen(false);
            toast({
                title: "Video Uploaded",
                description: "Your video message has been attached to the gift.",
            });
        }
        catch (error) {
            console.error('Video upload error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to upload video. Please try again.';
            toast({
                title: "Upload Failed",
                description: errorMessage,
                variant: "destructive",
            });
            setIsModalOpen(false);
        }
        finally {
            setIsUploading(false);
        }
    };
    const handleRemoveVideo = () => {
        setPosterUrl(null);
        onVideoRecorded('');
    };
    const handleCardClick = () => {
        if (isMobile) {
            handleNativeCameraClick();
        }
        else {
            handleModalOpen();
        }
    };
    return (_jsxs(_Fragment, { children: [isMobile && (_jsx("input", { ref: fileInputRef, type: "file", accept: "video/*", capture: "user" // Opens front-facing camera on mobile
                , onChange: handleVideoSelect, className: "hidden" })), videoUrl ? (_jsx(Card, { className: "border-2 border-border overflow-hidden", children: _jsxs(CardContent, { className: "p-0 relative", children: [_jsx("video", { ref: previewVideoRef, src: videoUrl, className: "w-full h-48 sm:h-64 bg-black object-cover", controls: true, playsInline: true, preload: "metadata", poster: posterUrl || undefined, onLoadedMetadata: (e) => {
                                // Generate thumbnail from first frame
                                const video = e.currentTarget;
                                if (video && !posterUrl && video.videoWidth > 0 && video.videoHeight > 0) {
                                    const canvas = document.createElement('canvas');
                                    canvas.width = video.videoWidth;
                                    canvas.height = video.videoHeight;
                                    const ctx = canvas.getContext('2d');
                                    if (ctx) {
                                        // Capture first frame by seeking to beginning
                                        const currentTime = video.currentTime;
                                        video.currentTime = Math.min(0.1, video.duration * 0.01 || 0.1);
                                        const captureFrame = () => {
                                            try {
                                                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                                                const thumbnailUrl = canvas.toDataURL('image/jpeg', 0.8);
                                                setPosterUrl(thumbnailUrl);
                                            }
                                            catch (err) {
                                                console.error('Error capturing video frame:', err);
                                            }
                                            // Reset video position
                                            video.currentTime = currentTime;
                                            video.removeEventListener('seeked', captureFrame);
                                        };
                                        video.addEventListener('seeked', captureFrame, { once: true });
                                    }
                                }
                            } }), _jsxs(Button, { size: "sm", variant: "destructive", onClick: handleRemoveVideo, className: "absolute top-2 right-2", children: [_jsx(X, { className: "w-4 h-4 mr-1" }), "Remove"] })] }) })) : (_jsx(Card, { className: "border-2 border-dashed border-border hover:border-primary/50 transition-colors cursor-pointer", onClick: handleCardClick, children: _jsx(CardContent, { className: "p-8 text-center", children: isUploading ? (_jsxs("div", { className: "flex flex-col items-center space-y-4", children: [_jsx(Loader2, { className: "w-12 h-12 animate-spin text-primary" }), _jsx("p", { className: "text-muted-foreground", children: "Uploading your video..." })] })) : (_jsxs("div", { className: "flex flex-col items-center space-y-4", children: [_jsx("div", { className: "w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center", children: _jsx(Video, { className: "w-8 h-8 text-primary" }) }), _jsxs("div", { children: [_jsx("p", { className: "font-semibold text-foreground mb-1", children: "Add a Video Message" }), _jsx("p", { className: "text-sm text-muted-foreground", children: isMobile ? "Tap to record a personal video" : "Click to record a personal video" })] })] })) }) })), !isMobile && (_jsx(Dialog, { open: isModalOpen, onOpenChange: (open) => {
                    if (!open) {
                        handleClose();
                    }
                }, children: _jsxs(DialogContent, { className: "sm:max-w-md", children: [_jsx(DialogHeader, { children: _jsx(DialogTitle, { children: "Record Video Message" }) }), _jsx("div", { className: "space-y-4", children: isUploading ? (_jsxs("div", { className: "flex flex-col items-center justify-center py-12 space-y-4", children: [_jsx(Loader2, { className: "w-12 h-12 animate-spin text-primary" }), _jsx("p", { className: "text-muted-foreground", children: "Uploading your video..." })] })) : (_jsxs(_Fragment, { children: [_jsxs("div", { className: "relative aspect-video rounded-lg overflow-hidden bg-muted", children: [_jsx("video", { ref: videoRef, autoPlay: true, playsInline: true, muted: true, className: "w-full h-full object-cover" }), isRecording && (_jsxs("div", { className: "absolute top-4 left-4 flex items-center gap-2 bg-red-600 text-white px-3 py-1 rounded-full", children: [_jsx("div", { className: "w-2 h-2 rounded-full bg-white animate-pulse" }), _jsx("span", { className: "text-sm font-medium", children: "Recording" })] }))] }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { variant: "outline", onClick: handleClose, className: "flex-1", disabled: isUploading, children: "Cancel" }), !isRecording ? (_jsxs(Button, { onClick: startRecording, className: "flex-1 bg-green-700 hover:bg-green-800 flex items-center justify-center gap-2", disabled: isUploading || !streamRef.current, children: [_jsx(Video, { className: "h-5 w-5" }), "Record"] })) : (_jsxs(Button, { onClick: stopRecording, variant: "destructive", className: "flex-1 flex items-center justify-center gap-2", disabled: isUploading, children: [_jsx(Square, { className: "h-5 w-5" }), "Stop & Upload"] }))] })] })) })] }) }))] }));
}
