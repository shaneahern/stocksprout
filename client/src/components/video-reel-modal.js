import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, ChevronLeft, ChevronRight, Play } from 'lucide-react';
export function VideoReelModal({ isOpen, onClose, videos }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);
    const [isAutoPlay, setIsAutoPlay] = useState(true);
    const videoRef = useRef(null);
    const currentVideo = videos[currentIndex];
    // Handle video end and auto-advance
    const handleVideoEnd = () => {
        if (currentIndex < videos.length - 1) {
            // Auto-advance to next video
            setCurrentIndex(prev => prev + 1);
        }
        else {
            // Reached the end, stop playing
            setIsPlaying(false);
        }
    };
    // Play/pause toggle
    const togglePlayPause = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
                setIsPlaying(false);
            }
            else {
                videoRef.current.play();
                setIsPlaying(true);
            }
        }
    };
    // Manual navigation
    const goToPrevious = () => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
            setIsPlaying(true);
        }
    };
    const goToNext = () => {
        if (currentIndex < videos.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setIsPlaying(true);
        }
    };
    // Reset when modal opens
    useEffect(() => {
        if (isOpen) {
            setCurrentIndex(0);
            setIsPlaying(true);
            setIsAutoPlay(true);
        }
    }, [isOpen]);
    // Auto-play when video changes and set volume
    useEffect(() => {
        if (videoRef.current) {
            // Set volume to medium (0.5) and unmute
            videoRef.current.volume = 0.5;
            videoRef.current.muted = false;
            // Auto-play if playing state is true
            if (isPlaying) {
                videoRef.current.play().catch(console.error);
            }
        }
    }, [currentIndex, isPlaying]);
    // Set volume when video loads
    useEffect(() => {
        const video = videoRef.current;
        if (video) {
            const handleLoadedMetadata = () => {
                video.volume = 0.5;
                video.muted = false;
            };
            video.addEventListener('loadedmetadata', handleLoadedMetadata);
            // Also set it immediately in case metadata is already loaded
            video.volume = 0.5;
            video.muted = false;
            return () => {
                video.removeEventListener('loadedmetadata', handleLoadedMetadata);
            };
        }
    }, [currentIndex]);
    if (!currentVideo)
        return null;
    return (_jsx(Dialog, { open: isOpen, onOpenChange: onClose, children: _jsx(DialogContent, { className: "max-w-md w-full h-[80vh] p-0 bg-black", children: _jsxs("div", { className: "relative w-full h-full flex flex-col", children: [_jsx(Button, { variant: "ghost", size: "sm", onClick: onClose, className: "absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white border-0 rounded-full w-8 h-8 p-0", children: _jsx(X, { className: "w-4 h-4" }) }), _jsxs("div", { className: "flex-1 relative bg-black", children: [_jsx("video", { ref: videoRef, src: currentVideo.videoUrl, className: "w-full h-full object-cover", onEnded: handleVideoEnd, onClick: togglePlayPause, autoPlay: true, crossOrigin: "anonymous" }), _jsx("div", { className: "absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 hover:opacity-100 transition-opacity cursor-pointer", onClick: togglePlayPause, children: !isPlaying && (_jsx("div", { className: "bg-white/20 rounded-full p-4", children: _jsx(Play, { className: "w-8 h-8 text-white" }) })) }), _jsx("div", { className: "absolute inset-y-0 left-0 flex items-center", children: currentIndex > 0 && (_jsx(Button, { variant: "ghost", size: "sm", onClick: goToPrevious, className: "bg-black/50 hover:bg-black/70 text-white border-0 rounded-full w-10 h-10 p-0 ml-2", children: _jsx(ChevronLeft, { className: "w-6 h-6" }) })) }), _jsx("div", { className: "absolute inset-y-0 right-0 flex items-center", children: currentIndex < videos.length - 1 && (_jsx(Button, { variant: "ghost", size: "sm", onClick: goToNext, className: "bg-black/50 hover:bg-black/70 text-white border-0 rounded-full w-10 h-10 p-0 mr-2", children: _jsx(ChevronRight, { className: "w-6 h-6" }) })) }), _jsxs("div", { className: "absolute top-4 left-4 bg-black/50 text-white px-2 py-1 rounded-full text-sm", children: [currentIndex + 1, " / ", videos.length] })] }), _jsxs("div", { className: "bg-white p-4 space-y-3", children: [_jsx("div", { className: "text-center", children: _jsxs("h3", { className: "font-bold text-lg text-gray-900", children: ["From ", currentVideo.giverName] }) }), currentVideo.investmentName && currentVideo.amount && (_jsxs("div", { className: "text-center", children: [_jsxs("p", { className: "text-sm text-gray-600", children: ["Gift: ", currentVideo.investmentName] }), _jsxs("p", { className: "text-sm font-semibold text-green-600", children: ["$", currentVideo.amount.toFixed(0)] })] })), currentVideo.message && (_jsx("div", { className: "bg-gray-50 rounded-lg p-3", children: _jsxs("p", { className: "text-sm italic text-gray-700 text-center", children: ["\"", currentVideo.message, "\""] }) })), _jsx("div", { className: "text-center", children: _jsx("p", { className: "text-xs text-gray-500", children: currentIndex < videos.length - 1
                                        ? `Auto-playing... ${videos.length - currentIndex - 1} more`
                                        : 'Last video' }) })] }), _jsx("div", { className: "bg-gray-200 h-1", children: _jsx("div", { className: "bg-green-600 h-full transition-all duration-300", style: { width: `${((currentIndex + 1) / videos.length) * 100}%` } }) })] }) }) }));
}
