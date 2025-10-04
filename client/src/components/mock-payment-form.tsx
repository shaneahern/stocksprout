import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard, Lock, AlertCircle, CheckCircle } from "lucide-react";
import { processMockPayment } from "@/lib/mock-stripe";

interface MockPaymentFormProps {
  amount: number;
  giftGiverName: string;
  onPaymentSuccess: (paymentId: string) => void;
  onPaymentError: (error: string) => void;
  disabled?: boolean;
}

export default function MockPaymentForm({ 
  amount, 
  giftGiverName, 
  onPaymentSuccess, 
  onPaymentError,
  disabled = false 
}: MockPaymentFormProps) {
  const [cardNumber, setCardNumber] = useState("4242 4242 4242 4242");
  const [expiry, setExpiry] = useState("12/28");
  const [cvc, setCvc] = useState("123");
  const [name, setName] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    if (formatted.length <= 19) {
      setCardNumber(formatted);
    }
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatExpiry(e.target.value);
    if (formatted.length <= 5) {
      setExpiry(formatted);
    }
  };

  const handlePayment = async () => {
    if (!cardNumber || !expiry || !cvc || !name) {
      onPaymentError("Please fill in all payment details");
      return;
    }

    setIsProcessing(true);
    
    try {
      const result = await processMockPayment(amount, giftGiverName);
      
      if (result.success && result.paymentId) {
        onPaymentSuccess(result.paymentId);
      } else {
        onPaymentError(result.error || "Payment failed");
      }
    } catch (error) {
      onPaymentError("Network error - please try again");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!showForm) {
    return (
      <Card className="border-2 border-dashed border-primary/20">
        <CardContent className="p-6 text-center">
          <CreditCard className="w-12 h-12 text-primary mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Payment Required</h3>
          <p className="text-muted-foreground mb-4">
            Complete payment to send this ${amount} investment gift
          </p>
          <Button 
            onClick={() => setShowForm(true)}
            className="bg-primary text-primary-foreground"
            data-testid="button-show-payment-form"
          >
            <Lock className="w-4 h-4 mr-2" />
            Enter Payment Details
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <CreditCard className="w-6 h-6" />
          <span>Payment Information</span>
        </CardTitle>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start space-x-2">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-semibold mb-1">Demo Mode - Mock Payment</p>
            <p>This is a simulated payment. No real charges will be made. Use the pre-filled test card details.</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          <div>
            <Label htmlFor="cardName">Cardholder Name</Label>
            <Input
              id="cardName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              disabled={disabled || isProcessing}
              data-testid="input-card-name"
            />
          </div>
          
          <div>
            <Label htmlFor="cardNumber">Card Number</Label>
            <Input
              id="cardNumber"
              value={cardNumber}
              onChange={handleCardNumberChange}
              placeholder="1234 5678 9012 3456"
              disabled={disabled || isProcessing}
              data-testid="input-card-number"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="expiry">Expiry Date</Label>
              <Input
                id="expiry"
                value={expiry}
                onChange={handleExpiryChange}
                placeholder="MM/YY"
                disabled={disabled || isProcessing}
                data-testid="input-card-expiry"
              />
            </div>
            <div>
              <Label htmlFor="cvc">CVC</Label>
              <Input
                id="cvc"
                value={cvc}
                onChange={(e) => setCvc(e.target.value.replace(/[^0-9]/g, '').substring(0, 4))}
                placeholder="123"
                disabled={disabled || isProcessing}
                data-testid="input-card-cvc"
              />
            </div>
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm text-muted-foreground">Amount to charge:</span>
            <span className="text-xl font-bold">${amount}</span>
          </div>
          
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowForm(false)}
              disabled={isProcessing}
              className="flex-1"
              data-testid="button-cancel-payment"
            >
              Cancel
            </Button>
            <Button
              onClick={handlePayment}
              disabled={disabled || isProcessing}
              className="flex-1 bg-success text-success-foreground"
              data-testid="button-process-payment"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Pay ${amount}
                </>
              )}
            </Button>
          </div>
        </div>
        
        <div className="text-xs text-muted-foreground text-center pt-2 border-t">
          <Lock className="w-3 h-3 inline mr-1" />
          Secured by Mock Stripe - This is a demo payment system
        </div>
      </CardContent>
    </Card>
  );
}