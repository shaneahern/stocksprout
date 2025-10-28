import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { X } from 'lucide-react';

interface VideoPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
  giftGiverName?: string;
}

export function VideoPlayerModal({ isOpen, onClose, videoUrl, giftGiverName }: VideoPlayerModalProps) {
  // Check if it's a real uploaded video (local uploads or Cloudinary URLs)
  const isRealVideo = videoUrl?.startsWith('/uploads/') || 
                       videoUrl?.includes('cloudinary.com') ||
                       videoUrl?.startsWith('http://') ||
                       videoUrl?.startsWith('https://');
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            {giftGiverName ? `Video Message from ${giftGiverName}` : 'Video Message'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
          {isRealVideo ? (
            // Real video player (handles both local and Cloudinary URLs)
            <video
              controls
              autoPlay
              playsInline
              className="w-full h-full"
              src={videoUrl}
              crossOrigin="anonymous"
            >
              <source src={videoUrl} type="video/mp4" />
              <source src={videoUrl} type="video/webm" />
              Your browser does not support the video tag.
            </video>
          ) : (
            // Fallback for old/invalid videos
            <div className="absolute inset-0 flex items-center justify-center text-white">
              <div className="text-center p-6">
                <div className="mb-4">
                  <svg 
                    className="w-20 h-20 mx-auto text-white/50" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" 
                    />
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                    />
                  </svg>
                </div>
                <p className="text-lg font-semibold mb-2">Video Not Available</p>
                <p className="text-sm text-white/70">
                  This video file could not be found or is in an old format.
                </p>
              </div>
            </div>
          )}
        </div>
        
        <div className="text-center text-sm text-muted-foreground mt-2">
          <p>💡 Tip: Video messages help preserve meaningful moments and financial wisdom for the child's future.</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
