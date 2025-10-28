import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, X, Gift, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { queryClient } from '@/lib/queryClient';
export function PendingGiftsModal({ isOpen, onClose }) {
    const { user, token } = useAuth();
    const { toast } = useToast();
    // When modal closes, ensure notifications are refreshed
    const handleClose = () => {
        queryClient.invalidateQueries({ queryKey: ['/api/all-notifications'] });
        onClose();
    };
    const { data: children = [] } = useQuery({
        queryKey: ['/api/children', user?.id],
        enabled: !!user?.id && isOpen,
    });
    const { data: allGifts = [], isLoading } = useQuery({
        queryKey: ['/api/pending-gifts'],
        queryFn: async () => {
            if (children.length === 0)
                return [];
            const giftPromises = children.map((child) => fetch(`/api/gifts/${child.id}`).then(res => res.json()));
            const giftArrays = await Promise.all(giftPromises);
            return giftArrays.flat();
        },
        enabled: isOpen && children.length > 0,
    });
    // Filter for pending gifts - treat undefined status as pending (new gifts before schema update)
    const pendingGifts = allGifts.filter((gift) => !gift.status || gift.status === 'pending');
    const approveMutation = useMutation({
        mutationFn: async (giftId) => {
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
                }
                catch (e) {
                    // If JSON parsing fails, use status text
                    errorMessage = response.statusText || errorMessage;
                }
                throw new Error(errorMessage);
            }
            try {
                const data = await response.json();
                return data;
            }
            catch (e) {
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
        onError: (error) => {
            toast({
                title: 'Error',
                description: error.message,
                variant: 'destructive',
            });
        },
    });
    const rejectMutation = useMutation({
        mutationFn: async (giftId) => {
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
        onError: (error) => {
            toast({
                title: 'Error',
                description: error.message,
                variant: 'destructive',
            });
        },
    });
    const getChildById = (childId) => {
        return children.find((child) => child.id === childId);
    };
    return (_jsx(Dialog, { open: isOpen, onOpenChange: handleClose, children: _jsxs(DialogContent, { className: "max-w-2xl max-h-[80vh] overflow-y-auto", children: [_jsx(DialogHeader, { children: _jsxs(DialogTitle, { className: "flex items-center gap-2", children: [_jsx(AlertCircle, { className: "w-5 h-5 text-primary" }), "Pending Gifts for Review"] }) }), isLoading ? (_jsx("div", { className: "flex items-center justify-center py-8", children: _jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-primary" }) })) : pendingGifts.length === 0 ? (_jsxs("div", { className: "text-center py-8", children: [_jsx(Gift, { className: "w-12 h-12 mx-auto text-muted-foreground mb-3" }), _jsx("p", { className: "text-muted-foreground", children: "No pending gifts to review" })] })) : (_jsxs("div", { className: "space-y-4", children: [_jsx("p", { className: "text-sm text-muted-foreground", children: "Review and approve or reject gifts sent to your children. Approved gifts will be added to their portfolios." }), pendingGifts.map((gift) => {
                            const child = getChildById(gift.childId);
                            return (_jsx(Card, { className: "border-2 border-primary/20", children: _jsx(CardContent, { className: "pt-4", children: _jsxs("div", { className: "flex items-start justify-between gap-4", children: [_jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center gap-2 mb-2", children: [_jsx(Badge, { variant: "secondary", children: "Pending Review" }), _jsxs("span", { className: "text-sm font-semibold", children: ["For: ", child?.name] })] }), _jsxs("div", { className: "space-y-1 mb-3", children: [_jsxs("p", { className: "text-sm", children: [_jsx("span", { className: "font-semibold", children: "From:" }), " ", gift.giftGiverName] }), _jsxs("p", { className: "text-sm", children: [_jsx("span", { className: "font-semibold", children: "Amount:" }), " $", parseFloat(gift.amount).toFixed(2)] }), _jsxs("p", { className: "text-sm", children: [_jsx("span", { className: "font-semibold", children: "Investment:" }), " ", gift.investment?.name, " (", gift.investment?.symbol, ")"] }), _jsxs("p", { className: "text-sm", children: [_jsx("span", { className: "font-semibold", children: "Shares:" }), " ", parseFloat(gift.shares).toFixed(4)] })] }), gift.message && (_jsx("div", { className: "bg-muted rounded-lg p-3 mb-3", children: _jsxs("p", { className: "text-sm italic", children: ["\"", gift.message, "\""] }) }))] }), _jsxs("div", { className: "flex flex-col gap-4", children: [_jsxs(Button, { size: "sm", onClick: () => approveMutation.mutate(gift.id), disabled: approveMutation.isPending || rejectMutation.isPending, className: "bg-green-700 hover:bg-green-800", children: [_jsx(Check, { className: "w-4 h-4 mr-1" }), "Approve"] }), _jsxs(Button, { size: "sm", variant: "destructive", onClick: () => rejectMutation.mutate(gift.id), disabled: approveMutation.isPending || rejectMutation.isPending, children: [_jsx(X, { className: "w-4 h-4 mr-1" }), "Reject"] })] })] }) }) }, gift.id));
                        })] }))] }) }));
}
