interface VideoRecorderProps {
    onVideoRecorded: (url: string) => void;
    videoUrl?: string;
}
export default function VideoRecorder({ onVideoRecorded, videoUrl }: VideoRecorderProps): import("react/jsx-runtime").JSX.Element;
export {};
