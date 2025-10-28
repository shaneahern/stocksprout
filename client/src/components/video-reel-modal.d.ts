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
export declare function VideoReelModal({ isOpen, onClose, videos }: VideoReelModalProps): import("react/jsx-runtime").JSX.Element | null;
export {};
