interface PhotoEditorModalProps {
    isOpen: boolean;
    onClose: () => void;
    imageUrl: string;
    onSave: (croppedImageUrl: string) => void;
    title?: string;
}
export default function PhotoEditorModal({ isOpen, onClose, imageUrl, onSave, title }: PhotoEditorModalProps): import("react/jsx-runtime").JSX.Element;
export {};
