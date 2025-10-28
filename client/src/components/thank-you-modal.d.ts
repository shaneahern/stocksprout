interface ThankYouModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSend: (message: string) => void;
    giftGiverName?: string;
}
export declare function ThankYouModal({ isOpen, onClose, onSend, giftGiverName }: ThankYouModalProps): import("react/jsx-runtime").JSX.Element;
export {};
