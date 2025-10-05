import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Video, Square, Play, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface VideoRecorderProps {
  onVideoRecorded: (url: string) => void;
}

export default function VideoRecorder({ onVideoRecorded }: VideoRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const liveVideoRef = useRef<HTMLVideoElement | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();

  const startRecording = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user', // Use front camera on mobile
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }, 
        audio: true 
      });
      
      setStream(mediaStream);
      
      // Display live video feed
      if (liveVideoRef.current) {
        liveVideoRef.current.srcObject = mediaStream;
      }
      
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
      
      mediaRecorderRef.current = new MediaRecorder(mediaStream, { mimeType });
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(blob);
        setRecordedVideoUrl(url);
        
        // Stop all tracks
        mediaStream.getTracks().forEach(track => track.stop());
        setStream(null);
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
        title: "Camera Access Denied",
        description: "Please allow camera access to record a video message.",
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
      videoRef.current.src = recordedVideoUrl;
      videoRef.current.play();
    }
  };

  return (
    <Card className="border-2 border-dashed border-border">
      <CardContent className="p-6 text-center">
        {recordedVideoUrl ? (
          <div className="space-y-4">
            <video
              ref={videoRef}
              className="w-full h-48 sm:h-64 bg-black rounded-lg"
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
                {isUploading ? "Uploading..." : "Use This Video"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setRecordedVideoUrl(null);
                  if (recordedVideoUrl) URL.revokeObjectURL(recordedVideoUrl);
                }}
                className="flex-1"
                data-testid="button-record-again"
              >
                Record Again
              </Button>
            </div>
          </div>
        ) : isRecording ? (
          <div className="space-y-4">
            <video
              ref={liveVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-48 sm:h-64 bg-black rounded-lg"
              data-testid="video-live-feed"
            />
            <Button
              onClick={stopRecording}
              variant="destructive"
              className="w-full"
              data-testid="button-stop-recording"
            >
              <Square className="w-4 h-4 mr-2" />
              Stop Recording
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <Video className="w-12 h-12 text-muted-foreground mx-auto" />
            <p className="text-muted-foreground">Record a personal video message</p>
            <Button
              onClick={startRecording}
              className="w-full"
              data-testid="button-start-recording"
            >
              <Video className="w-4 h-4 mr-2" />
              Start Recording
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
