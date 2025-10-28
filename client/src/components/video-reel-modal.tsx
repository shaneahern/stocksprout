import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';

interface VideoReelItem {
  id: string;
  videoUrl: string;
  giverName: string;
  message?: string | null;
  investmentName?: string;
  amount?: number;
}

interface VideoReelModalProps {
  isOpen: boolean;
  onClose: () => void;
  videos: VideoReelItem[];
}

export function VideoReelModal({ isOpen, onClose, videos }: VideoReelModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const currentVideo = videos[currentIndex];

  // Handle video end and auto-advance
  const handleVideoEnd = () => {
    if (currentIndex < videos.length - 1) {
      // Auto-advance to next video
      setCurrentIndex(prev => prev + 1);
    } else {
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
      } else {
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

  if (!currentVideo) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-full h-[80vh] p-0 bg-black">
        <div className="relative w-full h-full flex flex-col">
          {/* Close Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white border-0 rounded-full w-8 h-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>

          {/* Video Container */}
          <div className="flex-1 relative bg-black">
            <video
              ref={videoRef}
              src={currentVideo.videoUrl}
              className="w-full h-full object-cover"
              onEnded={handleVideoEnd}
              onClick={togglePlayPause}
              autoPlay
              crossOrigin="anonymous"
            />
            
            {/* Play/Pause Overlay */}
            <div 
              className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
              onClick={togglePlayPause}
            >
              {!isPlaying && (
                <div className="bg-white/20 rounded-full p-4">
                  <Play className="w-8 h-8 text-white" />
                </div>
              )}
            </div>

            {/* Navigation Arrows */}
            <div className="absolute inset-y-0 left-0 flex items-center">
              {currentIndex > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={goToPrevious}
                  className="bg-black/50 hover:bg-black/70 text-white border-0 rounded-full w-10 h-10 p-0 ml-2"
                >
                  <ChevronLeft className="w-6 h-6" />
                </Button>
              )}
            </div>

            <div className="absolute inset-y-0 right-0 flex items-center">
              {currentIndex < videos.length - 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={goToNext}
                  className="bg-black/50 hover:bg-black/70 text-white border-0 rounded-full w-10 h-10 p-0 mr-2"
                >
                  <ChevronRight className="w-6 h-6" />
                </Button>
              )}
            </div>

            {/* Video Counter */}
            <div className="absolute top-4 left-4 bg-black/50 text-white px-2 py-1 rounded-full text-sm">
              {currentIndex + 1} / {videos.length}
            </div>
          </div>

          {/* Video Info */}
          <div className="bg-white p-4 space-y-3">
            {/* Giver Name */}
            <div className="text-center">
              <h3 className="font-bold text-lg text-gray-900">
                From {currentVideo.giverName}
              </h3>
            </div>

            {/* Investment Details */}
            {currentVideo.investmentName && currentVideo.amount && (
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Gift: {currentVideo.investmentName}
                </p>
                <p className="text-sm font-semibold text-green-600">
                  ${currentVideo.amount.toFixed(0)}
                </p>
              </div>
            )}

            {/* Personal Message */}
            {currentVideo.message && (
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm italic text-gray-700 text-center">
                  "{currentVideo.message}"
                </p>
              </div>
            )}

            {/* Auto-play Status */}
            <div className="text-center">
              <p className="text-xs text-gray-500">
                {currentIndex < videos.length - 1 
                  ? `Auto-playing... ${videos.length - currentIndex - 1} more` 
                  : 'Last video'}
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="bg-gray-200 h-1">
            <div 
              className="bg-green-600 h-full transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / videos.length) * 100}%` }}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
