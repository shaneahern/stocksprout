import React, { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import InvestmentSelector from '@/components/investment-selector';
import MockPaymentForm from '@/components/mock-payment-form';
import VideoRecorder from '@/components/video-recorder';
import { DollarSign, ShoppingCart, X } from 'lucide-react';
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
  const [shares, setShares] = useState('');
  const [message, setMessage] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
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
      setMessage('');
      setVideoUrl('');
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
      message: message || `Investment purchase by ${user?.name}`,
      videoMessageUrl: videoUrl || undefined,
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

  // Bidirectional amount/shares handlers
  const handleAmountChange = (newAmount: string) => {
    setAmount(newAmount);
    if (selectedInvestment && newAmount) {
      const calculatedShares = (parseFloat(newAmount) / parseFloat(selectedInvestment.currentPrice)).toFixed(4);
      setShares(calculatedShares);
    } else {
      setShares('');
    }
  };

  const handleSharesChange = (newShares: string) => {
    setShares(newShares);
    if (selectedInvestment && newShares) {
      const calculatedAmount = (parseFloat(newShares) * parseFloat(selectedInvestment.currentPrice)).toFixed(2);
      setAmount(calculatedAmount);
    } else {
      setAmount('');
    }
  };

  // Initialize shares when investment is selected
  useEffect(() => {
    if (selectedInvestment && amount) {
      const calculatedShares = (parseFloat(amount) / parseFloat(selectedInvestment.currentPrice)).toFixed(4);
      setShares(calculatedShares);
    }
  }, [selectedInvestment]);

  const estimatedShares = shares || '0';

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
                      onChange={(e) => handleAmountChange(e.target.value)}
                      className="pl-8 text-2xl font-bold h-12"
                      min="0.01"
                      step="0.01"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Number of Shares
                  </label>
                  <Input
                    type="number"
                    value={shares}
                    onChange={(e) => handleSharesChange(e.target.value)}
                    className="text-2xl font-bold h-12"
                    min="0.0001"
                    step="0.0001"
                    placeholder="0.0000"
                  />
                  {selectedInvestment && (
                    <p className="text-sm text-muted-foreground mt-1">
                      shares of {selectedInvestment.name}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Message */}
          <Card>
            <CardContent className="pt-6">
              <label className="block text-sm font-semibold mb-2">
                Personal Message (Optional)
              </label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={`Add a personal message for ${childName}...`}
                className="min-h-[80px]"
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {message.length}/500 characters
              </p>
            </CardContent>
          </Card>

          {/* Video Message */}
          <Card>
            <CardContent className="pt-6">
              <label className="block text-sm font-semibold mb-3">
                Video Message (Optional)
              </label>
              {videoUrl ? (
                <div className="space-y-3">
                  <video
                    src={videoUrl}
                    controls
                    playsInline
                    className="w-full h-48 bg-black rounded-lg"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setVideoUrl('')}
                    className="w-full"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Remove Video
                  </Button>
                </div>
              ) : (
                <VideoRecorder onVideoRecorded={setVideoUrl} />
              )}
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

          {/* Summary and Action - Consolidated */}
          {!showPayment && (
            <Card className="bg-muted">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-bold mb-2">Purchase Summary</h3>
                    <div className="space-y-1 text-sm">
                      <p>
                        <span className="font-semibold">Amount:</span> ${amount} → {estimatedShares} shares
                      </p>
                      <p>
                        <span className="font-semibold">Investment:</span> {selectedInvestment?.name || 'Select an investment'}
                      </p>
                      <p>
                        <span className="font-semibold">For:</span> {childName}
                      </p>
                      {message && (
                        <p>
                          <span className="font-semibold">Message:</span> {message.substring(0, 50)}{message.length > 50 ? '...' : ''}
                        </p>
                      )}
                      {videoUrl && (
                        <p className="text-success">✓ Video message attached</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsOpen(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handlePurchase}
                      disabled={!selectedInvestment || purchaseMutation.isPending}
                      className="flex-1"
                    >
                      <DollarSign className="w-5 h-5 mr-2" />
                      Continue to Payment
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
