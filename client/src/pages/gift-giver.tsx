import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import InvestmentSelector from "@/components/investment-selector";
import VideoRecorder from "@/components/video-recorder";
import MockPaymentForm from "@/components/mock-payment-form";
import { RecurringContributionSetup } from "@/components/recurring-contribution-setup";
import { CheckCircle, Gift, DollarSign, MessageSquare, Video, CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function GiftGiver() {
  const [, params] = useRoute("/gift/:giftCode");
  const giftCode = params?.giftCode;
  const { toast } = useToast();
  
  const [selectedInvestment, setSelectedInvestment] = useState<any>(null);
  const [amount, setAmount] = useState("150");
  const [message, setMessage] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [giftGiverName, setGiftGiverName] = useState("");
  const [giftGiverEmail, setGiftGiverEmail] = useState("");
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [giftSent, setGiftSent] = useState(false);

  const { data: child, isLoading } = useQuery({
    queryKey: ["/api/children/by-gift-code", giftCode],
    enabled: !!giftCode,
  });

  // Type guard for child data
  const typedChild = child as any;

  const sendGiftMutation = useMutation({
    mutationFn: async (giftData: any) => {
      const response = await apiRequest("POST", "/api/gifts", giftData);
      return response.json();
    },
    onSuccess: () => {
      // Invalidate relevant caches
      queryClient.invalidateQueries({ queryKey: ["/api/children"] });
      queryClient.invalidateQueries({ queryKey: ["/api/portfolio", typedChild.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/gifts", typedChild.id] });
      
      setGiftSent(true);
      
      toast({
        title: "Gift Sent Successfully!",
        description: "Your investment gift has been sent to the child's portfolio.",
      });
      
      // Reset form but keep payment confirmation
      setSelectedInvestment(null);
      setAmount("150");
      setMessage("");
      setVideoUrl("");
      setShowPayment(false);
      // Note: Keep paymentId and giftGiverName for confirmation display
    },
    onError: () => {
      // Clear payment state on error
      setPaymentId(null);
      setShowPayment(false);
      
      toast({
        title: "Error Sending Gift",
        description: "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const handlePaymentSuccess = (paymentId: string) => {
    setPaymentId(paymentId);
    setShowPayment(false);
    
    // Validate amount
    const amountNum = Number(amount);
    if (amountNum <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount greater than $0.",
        variant: "destructive",
      });
      return;
    }
    
    // Proceed with gift creation after successful payment
    const giftData = {
      childId: typedChild.id,
      giftGiverName,
      giftGiverEmail,
      investmentId: selectedInvestment.id,
      amount: amountNum.toString(),
      message,
      videoMessageUrl: videoUrl || undefined,
      paymentId,
    };

    sendGiftMutation.mutate(giftData);
  };

  const handlePaymentError = (error: string) => {
    toast({
      title: "Payment Failed",
      description: error,
      variant: "destructive",
    });
  };

  const handleSendGift = () => {
    if (!typedChild || !selectedInvestment || !giftGiverName) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    // If payment is already completed, don't allow re-processing
    if (paymentId && !sendGiftMutation.isPending) {
      toast({
        title: "Gift Already Sent",
        description: "This gift has already been processed successfully.",
      });
      return;
    }

    // Show payment form if payment not completed
    if (!paymentId) {
      setShowPayment(true);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!typedChild) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <h1 className="text-2xl font-bold text-destructive mb-4">Invalid Gift Link</h1>
            <p className="text-muted-foreground">
              This gift link is not valid or has expired.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const estimatedShares = selectedInvestment && amount ? 
    (parseFloat(amount) / parseFloat(selectedInvestment.currentPrice)).toFixed(4) : "0";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-accent text-white p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold">StockSprout</h1>
              <p className="text-white/90 text-sm sm:text-base">Send an investment gift to {typedChild.name}</p>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-xs sm:text-sm text-white/80">Gift Link Code</p>
              <p className="font-mono text-base sm:text-lg font-bold">{giftCode}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6 sm:space-y-8">
        {/* Child Verification */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="w-6 h-6 text-success" />
              <span>Confirm Gift Recipient</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 bg-muted rounded-xl p-4 sm:p-6">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-primary rounded-full flex items-center justify-center text-white text-xl sm:text-2xl font-bold">
                {typedChild.name.charAt(0)}
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h3 className="text-xl sm:text-2xl font-bold text-foreground">{typedChild.name}</h3>
                <p className="text-muted-foreground text-base sm:text-lg">
                  {typedChild.age} years old
                  {typedChild.birthday && ` • Birthday: ${typedChild.birthday}`}
                </p>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-success rounded-full flex items-center justify-center mb-2">
                  <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-success-foreground" />
                </div>
                <p className="text-success font-semibold text-sm sm:text-base">Verified</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Your Information */}
        <Card>
          <CardHeader>
            <CardTitle>Your Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Your Name *
                </label>
                <Input
                  value={giftGiverName}
                  onChange={(e) => setGiftGiverName(e.target.value)}
                  placeholder="Enter your name"
                  data-testid="input-giver-name"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Your Email (Optional)
                </label>
                <Input
                  type="email"
                  value={giftGiverEmail}
                  onChange={(e) => setGiftGiverEmail(e.target.value)}
                  placeholder="Enter your email"
                  data-testid="input-giver-email"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Investment Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <DollarSign className="w-6 h-6" />
              <span>Choose an Investment</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <InvestmentSelector
              selectedInvestment={selectedInvestment}
              onSelectInvestment={setSelectedInvestment}
            />
          </CardContent>
        </Card>

        {/* Gift Amount */}
        <Card>
          <CardHeader>
            <CardTitle>Gift Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Dollar Amount
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
                    data-testid="input-gift-amount"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Estimated Shares
                </label>
                <div className="bg-muted rounded-lg p-4 h-12 flex items-center">
                  <div>
                    <p className="text-2xl font-bold text-foreground" data-testid="text-estimated-shares">
                      {estimatedShares}
                    </p>
                    {selectedInvestment && (
                      <p className="text-sm text-muted-foreground">
                        shares of {selectedInvestment.name}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Message */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageSquare className="w-6 h-6" />
              <span>Personal Message</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Inspirational Prompt */}
            <div className="mb-6 p-4 bg-primary/5 border-l-4 border-primary rounded-r-lg">
              <p className="text-sm text-foreground leading-relaxed">
                <strong className="text-primary">💡 Make it Meaningful:</strong> Every contribution is a chance to plant wisdom alongside wealth. 
                Consider adding a video or written message that sparks curiosity, excitement, and long-term thinking. 
                Whether it's a quote about patience, a story about your first investment, a lesson you learned along your financial journey, 
                or a reminder that money can be a tool for freedom, your words will help shape how this child sees their financial future. 
                Let your message be a compass they carry for years to come.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Video Message (Optional)
                </label>
                <VideoRecorder onVideoRecorded={setVideoUrl} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Written Message
                </label>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={`Write a personal message for ${typedChild.name}...`}
                  rows={8}
                  className="resize-none"
                  data-testid="textarea-message"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recurring Contribution Setup */}
        {!giftSent && selectedInvestment && giftGiverName && (
          <RecurringContributionSetup
            childId={typedChild.id}
            childName={typedChild.name}
            selectedInvestment={selectedInvestment}
            amount={amount}
            contributorName={giftGiverName}
            contributorEmail={giftGiverEmail}
          />
        )}

        {/* Payment */}
        {showPayment && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="w-6 h-6" />
                <span>Payment</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <MockPaymentForm
                amount={parseFloat(amount)}
                giftGiverName={giftGiverName}
                onPaymentSuccess={handlePaymentSuccess}
                onPaymentError={handlePaymentError}
                disabled={sendGiftMutation.isPending}
              />
            </CardContent>
          </Card>
        )}

        {/* Send Gift */}
        <Card className="bg-muted">
          <CardContent className="p-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-foreground">Gift Summary</h3>
                <p className="text-muted-foreground">
                  ${amount} → {estimatedShares} shares of{" "}
                  {selectedInvestment?.name || "Select an investment"}
                </p>
                <p className="text-muted-foreground">To: {typedChild.name}</p>
                {paymentId && (
                  <p className="text-success text-sm mt-2">✓ Payment confirmed: {paymentId}</p>
                )}
              </div>
              <Button
                onClick={handleSendGift}
                disabled={!selectedInvestment || !giftGiverName || sendGiftMutation.isPending || giftSent}
                className={`px-8 py-4 h-auto text-lg font-bold ${
                  giftSent 
                    ? "bg-success text-success-foreground" 
                    : "bg-gradient-to-r from-primary to-accent text-white"
                }`}
                data-testid="button-send-gift"
              >
                <Gift className="w-5 h-5 mr-2" />
                {sendGiftMutation.isPending 
                  ? "Sending..." 
                  : giftSent 
                    ? "Gift Sent Successfully!" 
                    : paymentId 
                      ? "Complete Gift" 
                      : "Review & Pay"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
