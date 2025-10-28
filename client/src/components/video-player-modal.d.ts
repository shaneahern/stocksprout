interface VideoPlayerModalProps {
    isOpen: boolean;
    onClose: () => void;
    videoUrl: string;
    giftGiverName?: string;
}
export declare function VideoPlayerModal({ isOpen, onClose, videoUrl, giftGiverName }: VideoPlayerModalProps): import("react/jsx-runtime").JSX.Element;
export {};
