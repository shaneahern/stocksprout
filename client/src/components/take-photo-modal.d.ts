interface TakePhotoModalProps {
    isOpen: boolean;
    onClose: () => void;
    onPhotoTaken: (imageDataUrl: string) => void;
    title?: string;
}
export default function TakePhotoModal({ isOpen, onClose, onPhotoTaken, title }: TakePhotoModalProps): import("react/jsx-runtime").JSX.Element;
export {};
