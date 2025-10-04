import React from 'react';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Share2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { generateSMSMessage, shareViaWebShare } from '@/lib/sms-utils';

interface SproutRequestFormProps {
  childId: string;
  childName: string;
}

export function SproutRequestForm({ childId, childName }: SproutRequestFormProps) {
  const { toast } = useToast();

  const generateLinkMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/generate-gift-link", {
        childId: childId
      });
      return response.json();
    },
    onSuccess: async (data) => {
      const smsMessage = generateSMSMessage(data.childName, data.giftLink);
      try {
        await shareViaWebShare({
          title: `Send a gift to ${data.childName}`,
          text: smsMessage,
          url: data.giftLink
        });
        toast({
          title: "Share Menu Opened!",
          description: `Choose how you want to share the gift link for ${childName}.`,
        });
      } catch (error) {
        // Fallback if sharing failed or was cancelled
        toast({
          title: "Share Ready",
          description: `Gift link generated for ${childName}. Use the share options to send it via SMS.`,
        });
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to generate gift link.",
        variant: "destructive",
      });
    },
  });

  const handleShareGiftLink = () => {
    generateLinkMutation.mutate();
  };

  return (
    <Button 
      onClick={handleShareGiftLink}
      disabled={generateLinkMutation.isPending}
      className="w-full bg-secondary text-secondary-foreground font-semibold"
    >
      <Share2 className="w-4 h-4 mr-2" />
      {generateLinkMutation.isPending ? "Generating..." : "Share Gift Link"}
    </Button>
  );
}
