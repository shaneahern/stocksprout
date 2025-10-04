import React from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, X, Gift, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { queryClient } from '@/lib/queryClient';

interface PendingGiftsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PendingGiftsModal({ isOpen, onClose }: PendingGiftsModalProps) {
  const { user, token } = useAuth();
  const { toast } = useToast();

  // When modal closes, ensure notifications are refreshed
  const handleClose = () => {
    queryClient.invalidateQueries({ queryKey: ['/api/all-notifications'] });
    onClose();
  };

  const { data: children = [] } = useQuery<any[]>({
    queryKey: ['/api/children', user?.id],
    enabled: !!user?.id && isOpen,
  });

  const { data: allGifts = [], isLoading } = useQuery<any[]>({
    queryKey: ['/api/pending-gifts'],
    queryFn: async () => {
      if (children.length === 0) return [];
      const giftPromises = children.map((child: any) =>
        fetch(`/api/gifts/${child.id}`).then(res => res.json())
      );
      const giftArrays = await Promise.all(giftPromises);
      return giftArrays.flat();
    },
    enabled: isOpen && children.length > 0,
  });

  // Filter for pending gifts - treat undefined status as pending (new gifts before schema update)
  const pendingGifts = allGifts.filter((gift: any) => !gift.status || gift.status === 'pending');

  const approveMutation = useMutation({
    mutationFn: async (giftId: string) => {
      const response = await fetch(`/api/gifts/${giftId}/approve`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        let errorMessage = 'Failed to approve gift';
        try {
          const error = await response.json();
          errorMessage = error.error || errorMessage;
        } catch (e) {
          // If JSON parsing fails, use status text
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      try {
        const data = await response.json();
        return data;
      } catch (e) {
        // If response is OK but JSON fails, still consider it success
        return { success: true };
      }
    },
    onSuccess: async () => {
      // Invalidate all relevant queries to refetch fresh data
      await queryClient.invalidateQueries({ queryKey: ['/api/pending-gifts'] });
      await queryClient.invalidateQueries({ queryKey: ['/api/gifts'] });
      await queryClient.invalidateQueries({ queryKey: ['/api/portfolio'] });
      await queryClient.invalidateQueries({ queryKey: ['/api/children'] });
      await queryClient.invalidateQueries({ queryKey: ['/api/all-notifications'] });
      
      // Refetch the data for this modal
      await queryClient.refetchQueries({ queryKey: ['/api/pending-gifts'] });
      
      toast({
        title: 'Gift Approved!',
        description: 'The gift has been added to the portfolio.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (giftId: string) => {
      const response = await fetch(`/api/gifts/${giftId}/reject`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to reject gift');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/pending-gifts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/gifts'] });
      toast({
        title: 'Gift Rejected',
        description: 'The gift has been declined.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const getChildById = (childId: string) => {
    return children.find((child: any) => child.id === childId);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-primary" />
            Pending Gifts for Review
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : pendingGifts.length === 0 ? (
          <div className="text-center py-8">
            <Gift className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No pending gifts to review</p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Review and approve or reject gifts sent to your children. Approved gifts will be added to their portfolios.
            </p>

            {pendingGifts.map((gift: any) => {
              const child = getChildById(gift.childId);
              return (
                <Card key={gift.id} className="border-2 border-primary/20">
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="secondary">Pending Review</Badge>
                          <span className="text-sm font-semibold">
                            For: {child?.name}
                          </span>
                        </div>

                        <div className="space-y-1 mb-3">
                          <p className="text-sm">
                            <span className="font-semibold">From:</span> {gift.giftGiverName}
                          </p>
                          <p className="text-sm">
                            <span className="font-semibold">Amount:</span> ${parseFloat(gift.amount).toFixed(2)}
                          </p>
                          <p className="text-sm">
                            <span className="font-semibold">Investment:</span> {gift.investment?.name} ({gift.investment?.symbol})
                          </p>
                          <p className="text-sm">
                            <span className="font-semibold">Shares:</span> {parseFloat(gift.shares).toFixed(4)}
                          </p>
                        </div>

                        {gift.message && (
                          <div className="bg-muted rounded-lg p-3 mb-3">
                            <p className="text-sm italic">"{gift.message}"</p>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-2">
                        <Button
                          size="sm"
                          onClick={() => approveMutation.mutate(gift.id)}
                          disabled={approveMutation.isPending || rejectMutation.isPending}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => rejectMutation.mutate(gift.id)}
                          disabled={approveMutation.isPending || rejectMutation.isPending}
                        >
                          <X className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
