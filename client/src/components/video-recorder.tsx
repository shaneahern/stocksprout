import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Video, Square, Play, Upload, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface VideoRecorderProps {
  onVideoRecorded: (url: string) => void;
  videoUrl?: string;
}

export default function VideoRecorder({ onVideoRecorded, videoUrl }: VideoRecorderProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false); // Camera preview active
  const [isRecording, setIsRecording] = useState(false); // Actually recording
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const liveVideoRef = useRef<HTMLVideoElement | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();

  const startPreview = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user', // Use front camera on mobile
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }, 
        audio: true 
      });
      
      console.log('Camera stream obtained:', mediaStream.active);
      setStream(mediaStream);
      setIsPreviewing(true);
      
      // Display live video feed - use a timeout to ensure DOM is ready
      setTimeout(() => {
        if (liveVideoRef.current) {
          console.log('Setting stream on video element');
          liveVideoRef.current.srcObject = mediaStream;
          
          // Wait for metadata to load, then play
          liveVideoRef.current.onloadedmetadata = async () => {
            try {
              console.log('Video metadata loaded, starting playback');
              await liveVideoRef.current?.play();
              console.log('Live video preview started successfully');
            } catch (err) {
              console.error('Error playing video stream:', err);
            }
          };
        } else {
          console.error('liveVideoRef.current is null');
        }
      }, 100);
    } catch (error) {
      console.error('Video preview error:', error);
      toast({
        title: "Camera Access Denied",
        description: "Please allow camera access to record a video message.",
        variant: "destructive",
      });
    }
  };

  const startRecording = async () => {
    if (!stream) {
      console.error('No stream available');
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
      
      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType });
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        console.log('Recording stopped, chunks count:', chunksRef.current.length);
        const blob = new Blob(chunksRef.current, { type: mimeType });
        console.log('Blob created, size:', blob.size, 'type:', blob.type);
        const url = URL.createObjectURL(blob);
        console.log('Video URL created:', url);
        setRecordedVideoUrl(url);
        
        // Stop all tracks and clean up
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
        setIsPreviewing(false);
        
        // Auto-load the video
        setTimeout(() => {
          if (videoRef.current) {
            console.log('Loading recorded video');
            videoRef.current.load();
          }
        }, 100);
      };

      mediaRecorderRef.current.start();
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
      
      toast({
        title: "Recording Stopped",
        description: "Your video message has been recorded.",
      });
    }
  };

  const uploadVideo = async () => {
    if (!recordedVideoUrl) return;

    setIsUploading(true);
    try {
      // Convert blob URL to actual blob
      const response = await fetch(recordedVideoUrl);
      const blob = await response.blob();
      
      // Determine file extension based on MIME type
      const mimeType = blob.type;
      let extension = 'webm';
      if (mimeType.includes('mp4')) {
        extension = 'mp4';
      } else if (mimeType.includes('webm')) {
        extension = 'webm';
      }
      
      // Create form data with the video file
      const formData = new FormData();
      formData.append('video', blob, `video-${Date.now()}.${extension}`);
      
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
    } finally {
      setIsUploading(false);
    }
  };

  const playRecording = () => {
    if (videoRef.current && recordedVideoUrl) {
      console.log('Playing video:', recordedVideoUrl);
      videoRef.current.load();
      videoRef.current.play().catch(err => {
        console.error('Error playing video:', err);
      });
    }
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsPreviewing(false);
    setIsRecording(false);
    setRecordedVideoUrl(null);
    setIsModalOpen(false);
  };

  const handleRemoveVideo = () => {
    onVideoRecorded('');
  };

  return (
    <>
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
          onClick={handleOpenModal}
        >
          <CardContent className="p-8 text-center">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Video className="w-8 h-8 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-foreground mb-1">Add a Video Message</p>
                <p className="text-sm text-muted-foreground">Click to record a personal video</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Record Video Message</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {recordedVideoUrl ? (
              <div className="space-y-4">
                <video
                  ref={videoRef}
                  src={recordedVideoUrl}
                  className="w-full h-64 sm:h-96 bg-black rounded-lg"
                  controls
                  playsInline
                  data-testid="video-preview"
                />
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={playRecording}
                    className="flex-1"
                    data-testid="button-play-recording"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Play
                  </Button>
                  <Button
                    size="sm"
                    onClick={uploadVideo}
                    disabled={isUploading}
                    className="flex-1"
                    data-testid="button-upload-video"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {isUploading ? "Uploading..." : "Save Video"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setRecordedVideoUrl(null);
                      if (recordedVideoUrl) URL.revokeObjectURL(recordedVideoUrl);
                      setIsPreviewing(false);
                      setIsRecording(false);
                    }}
                    className="flex-1"
                    data-testid="button-record-again"
                  >
                    Re-record
                  </Button>
                </div>
              </div>
            ) : isPreviewing ? (
              <div className="space-y-4">
                <video
                  ref={liveVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-64 sm:h-96 bg-black rounded-lg"
                  data-testid="video-live-feed"
                />
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (stream) {
                        stream.getTracks().forEach(track => track.stop());
                        setStream(null);
                      }
                      setIsPreviewing(false);
                      setIsRecording(false);
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  {isRecording ? (
                    <Button
                      onClick={stopRecording}
                      variant="destructive"
                      className="flex-1"
                      data-testid="button-stop-recording"
                    >
                      <Square className="w-4 h-4 mr-2" />
                      Stop Recording
                    </Button>
                  ) : (
                    <Button
                      onClick={startRecording}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      data-testid="button-start-recording"
                    >
                      <Video className="w-4 h-4 mr-2" />
                      Start Recording
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4 py-8">
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                    <Video className="w-10 h-10 text-primary" />
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold text-foreground mb-2">Ready to record?</p>
                    <p className="text-sm text-muted-foreground">
                      Share a personal message that will be cherished for years to come
                    </p>
                  </div>
                </div>
                <Button
                  onClick={startPreview}
                  className="w-full"
                  size="lg"
                  data-testid="button-record-video-message"
                >
                  <Video className="w-5 h-5 mr-2" />
                  Start Recording
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
