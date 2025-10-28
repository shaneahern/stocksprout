interface MockPaymentFormProps {
    amount: number;
    giftGiverName: string;
    investmentName: string;
    shares: string;
    childName: string;
    onPaymentSuccess: (paymentId: string) => void;
    onPaymentError: (error: string) => void;
    disabled?: boolean;
}
export default function MockPaymentForm({ amount, giftGiverName, investmentName, shares, childName, onPaymentSuccess, onPaymentError, disabled }: MockPaymentFormProps): import("react/jsx-runtime").JSX.Element;
export {};
