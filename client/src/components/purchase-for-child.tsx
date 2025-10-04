import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import InvestmentSelector from '@/components/investment-selector';
import MockPaymentForm from '@/components/mock-payment-form';
import { DollarSign, ShoppingCart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { queryClient } from '@/lib/queryClient';

interface PurchaseForChildProps {
  childId: string;
  childName: string;
}

export function PurchaseForChild({ childId, childName }: PurchaseForChildProps) {
  const { user, token } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedInvestment, setSelectedInvestment] = useState<any>(null);
  const [amount, setAmount] = useState('100');
  const [showPayment, setShowPayment] = useState(false);
  const [paymentId, setPaymentId] = useState<string | null>(null);

  const purchaseMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/gifts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Purchase failed');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/portfolio', childId] });
      queryClient.invalidateQueries({ queryKey: ['/api/gifts', childId] });
      
      toast({
        title: 'Purchase Successful!',
        description: `Successfully purchased ${selectedInvestment?.symbol} for ${childName}`,
      });
      
      // Reset form
      setSelectedInvestment(null);
      setAmount('100');
      setPaymentId(null);
      setShowPayment(false);
      setIsOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: 'Purchase Failed',
        description: error.message,
        variant: 'destructive',
      });
      setPaymentId(null);
      setShowPayment(false);
    },
  });

  const handlePaymentSuccess = (newPaymentId: string) => {
    setPaymentId(newPaymentId);
    setShowPayment(false);
    
    // Validate amount
    const amountNum = Number(amount);
    if (amountNum <= 0) {
      toast({
        title: 'Invalid Amount',
        description: 'Please enter a valid amount greater than $0.',
        variant: 'destructive',
      });
      return;
    }
    
    // Proceed with purchase
    const purchaseData = {
      childId,
      giftGiverName: user?.name || 'Parent',
      giftGiverEmail: user?.email || undefined,
      contributorId: user?.id || null, // Link to parent as contributor
      giftGiverProfileImageUrl: user?.profileImageUrl || null, // Include parent's profile photo
      investmentId: selectedInvestment.id,
      amount: amountNum.toString(),
      message: `Investment purchase by ${user?.name}`,
      videoMessageUrl: undefined,
      paymentId: newPaymentId,
    };

    purchaseMutation.mutate(purchaseData);
  };

  const handlePaymentError = (error: string) => {
    toast({
      title: 'Payment Failed',
      description: error,
      variant: 'destructive',
    });
    setPaymentId(null);
  };

  const handlePurchase = () => {
    if (!selectedInvestment) {
      toast({
        title: 'No Investment Selected',
        description: 'Please select an investment first.',
        variant: 'destructive',
      });
      return;
    }

    const amountNum = Number(amount);
    if (amountNum <= 0) {
      toast({
        title: 'Invalid Amount',
        description: 'Please enter a valid amount greater than $0.',
        variant: 'destructive',
      });
      return;
    }

    if (!paymentId) {
      setShowPayment(true);
    }
  };

  const estimatedShares = selectedInvestment && amount
    ? (parseFloat(amount) / parseFloat(selectedInvestment.currentPrice)).toFixed(4)
    : '0';

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">
          <ShoppingCart className="w-4 h-4 mr-2" />
          Purchase Investment
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Purchase Investment for {childName}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Investment Selection */}
          <Card>
            <CardContent className="pt-6">
              <InvestmentSelector
                selectedInvestment={selectedInvestment}
                onSelectInvestment={setSelectedInvestment}
              />
            </CardContent>
          </Card>

          {/* Amount */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Purchase Amount
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground text-xl">
                      $
                    </span>
                    <Input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="pl-8 text-2xl font-bold h-12"
                      min="1"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Estimated Shares
                  </label>
                  <div className="bg-muted rounded-lg p-4 h-12 flex items-center">
                    <p className="text-2xl font-bold">
                      {estimatedShares}
                    </p>
                  </div>
                  {selectedInvestment && (
                    <p className="text-sm text-muted-foreground mt-1">
                      shares of {selectedInvestment.name}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment */}
          {showPayment && (
            <Card>
              <CardContent className="pt-6">
                <MockPaymentForm
                  amount={parseFloat(amount)}
                  giftGiverName={user?.name || 'Parent'}
                  onPaymentSuccess={handlePaymentSuccess}
                  onPaymentError={handlePaymentError}
                  disabled={purchaseMutation.isPending}
                />
              </CardContent>
            </Card>
          )}

          {/* Summary and Action */}
          <Card className="bg-muted">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold">Purchase Summary</h3>
                  <p className="text-muted-foreground">
                    ${amount} → {estimatedShares} shares of{' '}
                    {selectedInvestment?.name || 'Select an investment'}
                  </p>
                  <p className="text-muted-foreground">For: {childName}</p>
                  {paymentId && (
                    <p className="text-success text-sm mt-2">
                      ✓ Payment confirmed: {paymentId}
                    </p>
                  )}
                </div>
                <Button
                  onClick={handlePurchase}
                  disabled={!selectedInvestment || purchaseMutation.isPending}
                  size="lg"
                >
                  <DollarSign className="w-5 h-5 mr-2" />
                  {purchaseMutation.isPending
                    ? 'Processing...'
                    : paymentId
                    ? 'Complete Purchase'
                    : 'Review & Pay'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
