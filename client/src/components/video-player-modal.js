import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
export function VideoPlayerModal({ isOpen, onClose, videoUrl, giftGiverName }) {
    // Check if it's a real uploaded video (local uploads or Cloudinary URLs)
    const isRealVideo = videoUrl?.startsWith('/uploads/') ||
        videoUrl?.includes('cloudinary.com') ||
        videoUrl?.startsWith('http://') ||
        videoUrl?.startsWith('https://');
    return (_jsx(Dialog, { open: isOpen, onOpenChange: onClose, children: _jsxs(DialogContent, { className: "max-w-3xl", children: [_jsx(DialogHeader, { children: _jsx(DialogTitle, { children: giftGiverName ? `Video Message from ${giftGiverName}` : 'Video Message' }) }), _jsx("div", { className: "relative aspect-video bg-black rounded-lg overflow-hidden", children: isRealVideo ? (
                    // Real video player (handles both local and Cloudinary URLs)
                    _jsxs("video", { controls: true, autoPlay: true, playsInline: true, className: "w-full h-full", src: videoUrl, crossOrigin: "anonymous", children: [_jsx("source", { src: videoUrl, type: "video/mp4" }), _jsx("source", { src: videoUrl, type: "video/webm" }), "Your browser does not support the video tag."] })) : (
                    // Fallback for old/invalid videos
                    _jsx("div", { className: "absolute inset-0 flex items-center justify-center text-white", children: _jsxs("div", { className: "text-center p-6", children: [_jsx("div", { className: "mb-4", children: _jsxs("svg", { className: "w-20 h-20 mx-auto text-white/50", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: [_jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" }), _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M21 12a9 9 0 11-18 0 9 9 0 0118 0z" })] }) }), _jsx("p", { className: "text-lg font-semibold mb-2", children: "Video Not Available" }), _jsx("p", { className: "text-sm text-white/70", children: "This video file could not be found or is in an old format." })] }) })) }), _jsx("div", { className: "text-center text-sm text-muted-foreground mt-2", children: _jsx("p", { children: "\uD83D\uDCA1 Tip: Video messages help preserve meaningful moments and financial wisdom for the child's future." }) })] }) }));
}
