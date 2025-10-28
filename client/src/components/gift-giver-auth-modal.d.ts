interface GiftGiverAuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAuthenticated: (contributor: any, isNewUser: boolean) => void;
    childName: string;
}
export declare function GiftGiverAuthModal({ isOpen, onClose, onAuthenticated, childName }: GiftGiverAuthModalProps): import("react/jsx-runtime").JSX.Element;
export {};
