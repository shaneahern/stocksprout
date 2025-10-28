export interface MockPaymentIntent {
    id: string;
    amount: number;
    currency: string;
    status: 'succeeded' | 'failed' | 'processing';
    clientSecret: string;
}
export interface MockCardElement {
    complete: boolean;
    empty: boolean;
    focused: boolean;
}
export declare const mockStripe: {
    confirmCardPayment: (clientSecret: string, paymentData: any) => Promise<{
        paymentIntent?: MockPaymentIntent;
        error?: {
            message: string;
        };
    }>;
    elements: () => {
        create: (type: string) => {
            mount: (selector: string) => void;
            unmount: () => void;
            addEventListener: (event: string, handler: Function) => void;
            removeEventListener: (event: string, handler: Function) => void;
        };
    };
};
export declare function processMockPayment(amount: number, giftGiverName: string): Promise<{
    success: boolean;
    paymentId?: string;
    error?: string;
}>;
export declare function useMockStripeElements(): {
    stripe: {
        confirmCardPayment: (clientSecret: string, paymentData: any) => Promise<{
            paymentIntent?: MockPaymentIntent;
            error?: {
                message: string;
            };
        }>;
        elements: () => {
            create: (type: string) => {
                mount: (selector: string) => void;
                unmount: () => void;
                addEventListener: (event: string, handler: Function) => void;
                removeEventListener: (event: string, handler: Function) => void;
            };
        };
    };
    elements: {
        create: (type: string) => {
            mount: (selector: string) => void;
            unmount: () => void;
            addEventListener: (event: string, handler: Function) => void;
            removeEventListener: (event: string, handler: Function) => void;
        };
    };
};
