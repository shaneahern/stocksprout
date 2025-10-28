import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Video, Square, X, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface VideoRecorderProps {
  onVideoRecorded: (url: string) => void;
  videoUrl?: string;
}

// Detect if device is mobile
const isMobileDevice = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
    (typeof window !== 'undefined' && window.innerWidth <= 768);
};

export default function VideoRecorder({ onVideoRecorded, videoUrl }: VideoRecorderProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Detect mobile on mount
  useEffect(() => {
    setIsMobile(isMobileDevice());
  }, []);

  // ========== Native Camera (Mobile) ==========
  const handleVideoSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

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
    } catch (error) {
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
      } else if (MediaRecorder.isTypeSupported('video/webm;codecs=h264')) {
        mimeType = 'video/webm;codecs=h264';
      } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
        mimeType = 'video/webm;codecs=vp9';
      } else if (MediaRecorder.isTypeSupported('video/webm')) {
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
    } catch (error) {
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
  const uploadVideo = async (fileOrBlob: File | Blob) => {
    setIsUploading(true);
    try {
      // Create form data with the video file
      const formData = new FormData();
      
      // Determine filename and extension
      let filename = `video-${Date.now()}`;
      let extension = 'webm';
      
      if (fileOrBlob instanceof File) {
        filename = fileOrBlob.name;
        const mimeType = fileOrBlob.type;
        if (mimeType.includes('mp4')) {
          extension = 'mp4';
        } else if (mimeType.includes('webm')) {
          extension = 'webm';
        }
      } else {
        const mimeType = fileOrBlob.type;
        if (mimeType.includes('mp4')) {
          extension = 'mp4';
        } else if (mimeType.includes('webm')) {
          extension = 'webm';
        }
        filename = `${filename}.${extension}`;
      }
      
      formData.append('video', fileOrBlob, filename);

      // Upload to server
      const uploadResponse = await fetch('/api/upload-video', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('Upload failed');
      }

      const data = await uploadResponse.json();
      onVideoRecorded(data.videoUrl);

      setIsModalOpen(false);

      toast({
        title: "Video Uploaded",
        description: "Your video message has been attached to the gift.",
      });
    } catch (error) {
      console.error('Video upload error:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload video. Please try again.",
        variant: "destructive",
      });
      setIsModalOpen(false);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveVideo = () => {
    onVideoRecorded('');
  };

  const handleCardClick = () => {
    if (isMobile) {
      handleNativeCameraClick();
    } else {
      handleModalOpen();
    }
  };

  return (
    <>
      {/* Native file input for mobile */}
      {isMobile && (
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          capture="user" // Opens front-facing camera on mobile
          onChange={handleVideoSelect}
          className="hidden"
        />
      )}
      
      {videoUrl ? (
        <Card className="border-2 border-border overflow-hidden">
          <CardContent className="p-0 relative">
            <video
              src={videoUrl}
              className="w-full h-48 sm:h-64 bg-black object-cover"
              controls
              playsInline
            />
            <Button
              size="sm"
              variant="destructive"
              onClick={handleRemoveVideo}
              className="absolute top-2 right-2"
            >
              <X className="w-4 h-4 mr-1" />
              Remove
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card
          className="border-2 border-dashed border-border hover:border-primary/50 transition-colors cursor-pointer"
          onClick={handleCardClick}
        >
          <CardContent className="p-8 text-center">
            {isUploading ? (
              <div className="flex flex-col items-center space-y-4">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
                <p className="text-muted-foreground">Uploading your video...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Video className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground mb-1">Add a Video Message</p>
                  <p className="text-sm text-muted-foreground">
                    {isMobile ? "Tap to record a personal video" : "Click to record a personal video"}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Web-based recording modal for desktop */}
      {!isMobile && (
        <Dialog open={isModalOpen} onOpenChange={(open) => {
          if (!open) {
            handleClose();
          }
        }}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Record Video Message</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              {isUploading ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <Loader2 className="w-12 h-12 animate-spin text-primary" />
                  <p className="text-muted-foreground">Uploading your video...</p>
                </div>
              ) : (
                <>
                  <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                    {isRecording && (
                      <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-600 text-white px-3 py-1 rounded-full">
                        <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                        <span className="text-sm font-medium">Recording</span>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={handleClose}
                      className="flex-1"
                      disabled={isUploading}
                    >
                      Cancel
                    </Button>
                    {!isRecording ? (
                      <Button
                        onClick={startRecording}
                        className="flex-1 bg-green-700 hover:bg-green-800 flex items-center justify-center gap-2"
                        disabled={isUploading || !streamRef.current}
                      >
                        <Video className="h-5 w-5" />
                        Record
                      </Button>
                    ) : (
                      <Button
                        onClick={stopRecording}
                        variant="destructive"
                        className="flex-1 flex items-center justify-center gap-2"
                        disabled={isUploading}
                      >
                        <Square className="h-5 w-5" />
                        Stop & Upload
                      </Button>
                    )}
                  </div>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
