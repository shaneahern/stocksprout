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
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        setRecordedVideoUrl(url);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      
      toast({
        title: "Recording Started",
        description: "Recording your video message...",
      });
    } catch (error) {
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
      
      // Create form data with the video file
      const formData = new FormData();
      formData.append('video', blob, `video-${Date.now()}.webm`);
      
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
              className="w-full h-32 bg-black rounded-lg"
              controls
              data-testid="video-preview"
            />
            <div className="flex space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={playRecording}
                data-testid="button-play-recording"
              >
                <Play className="w-4 h-4 mr-2" />
                Play
              </Button>
              <Button
                size="sm"
                onClick={uploadVideo}
                disabled={isUploading}
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
                data-testid="button-record-again"
              >
                Record Again
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <Video className="w-12 h-12 text-muted-foreground mx-auto" />
            <p className="text-muted-foreground">Record a personal video message</p>
            <Button
              onClick={isRecording ? stopRecording : startRecording}
              variant={isRecording ? "destructive" : "default"}
              data-testid="button-record-video"
            >
              {isRecording ? (
                <>
                  <Square className="w-4 h-4 mr-2" />
                  Stop Recording
                </>
              ) : (
                <>
                  <Video className="w-4 h-4 mr-2" />
                  Start Recording
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
