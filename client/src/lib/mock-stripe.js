// Mock Stripe payment functionality for development
// Mock Stripe API
export const mockStripe = {
    confirmCardPayment: async (clientSecret, paymentData) => {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        // Mock success for most cases (95% success rate)
        const isSuccess = Math.random() > 0.05;
        if (isSuccess) {
            return {
                paymentIntent: {
                    id: `pi_mock_${Date.now()}`,
                    amount: 15000, // $150 in cents
                    currency: 'usd',
                    status: 'succeeded',
                    clientSecret
                }
            };
        }
        else {
            return {
                error: {
                    message: 'Your card was declined. Please try a different payment method.'
                }
            };
        }
    },
    elements: () => ({
        create: (type) => ({
            mount: (selector) => {
                console.log(`Mock ${type} element mounted to ${selector}`);
            },
            unmount: () => {
                console.log('Mock element unmounted');
            },
            addEventListener: (event, handler) => {
                console.log(`Mock event listener added for ${event}`);
            },
            removeEventListener: (event, handler) => {
                console.log(`Mock event listener removed for ${event}`);
            }
        })
    })
};
// Mock payment processing function
export async function processMockPayment(amount, giftGiverName) {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1500));
    // Mock success (99.5% success rate for easier testing)
    const isSuccess = Math.random() > 0.005;
    if (isSuccess) {
        return {
            success: true,
            paymentId: `pay_mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        };
    }
    else {
        const errors = [
            'Payment declined - insufficient funds',
            'Payment failed - invalid card number',
            'Payment rejected - suspected fraud',
            'Network error - please try again'
        ];
        return {
            success: false,
            error: errors[Math.floor(Math.random() * errors.length)]
        };
    }
}
// Mock Stripe Elements hook
export function useMockStripeElements() {
    return {
        stripe: mockStripe,
        elements: mockStripe.elements()
    };
}
