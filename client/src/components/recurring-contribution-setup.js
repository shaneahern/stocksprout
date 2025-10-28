import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calendar, RefreshCw, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
export function RecurringContributionSetup({ childId, childName, selectedInvestment, amount, contributorName, contributorEmail, }) {
    const { toast } = useToast();
    const [enableRecurring, setEnableRecurring] = useState(false);
    const [frequency, setFrequency] = useState('monthly');
    const setupRecurringMutation = useMutation({
        mutationFn: async (data) => {
            const response = await fetch('/api/recurring-contributions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to set up recurring contribution');
            }
            return response.json();
        },
        onSuccess: (data) => {
            toast({
                title: 'Recurring Contribution Set Up!',
                description: `Your ${frequency} contribution of $${amount} has been scheduled.`,
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
    const handleSetupRecurring = () => {
        if (!selectedInvestment) {
            toast({
                title: 'No Investment Selected',
                description: 'Please select an investment first.',
                variant: 'destructive',
            });
            return;
        }
        const recurringData = {
            childId,
            contributorEmail: contributorEmail || undefined,
            contributorName,
            investmentId: selectedInvestment.id,
            amount,
            frequency,
        };
        setupRecurringMutation.mutate(recurringData);
    };
    const getNextContributionDate = () => {
        const now = new Date();
        if (frequency === 'monthly') {
            const next = new Date(now);
            next.setMonth(next.getMonth() + 1);
            return next.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
        }
        else {
            const next = new Date(now);
            next.setFullYear(next.getFullYear() + 1);
            return next.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
        }
    };
    return (_jsxs(Card, { className: "border-2 border-primary/20", children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2 text-lg", children: [_jsx(RefreshCw, { className: "w-5 h-5 text-primary" }), "Set Up Recurring Contribution"] }) }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs(Alert, { children: [_jsx(Info, { className: "w-4 h-4" }), _jsxs(AlertDescription, { children: ["Make this contribution recurring to automatically invest in ", childName, "'s future every month or year."] })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx(Label, { htmlFor: "enable-recurring", className: "text-base font-semibold", children: "Enable Recurring Contributions" }), _jsx(Switch, { id: "enable-recurring", checked: enableRecurring, onCheckedChange: setEnableRecurring })] }), enableRecurring && (_jsxs("div", { className: "space-y-4 pl-4 border-l-2 border-primary", children: [_jsxs("div", { children: [_jsx(Label, { className: "text-sm font-semibold mb-3 block", children: "Frequency" }), _jsxs(RadioGroup, { value: frequency, onValueChange: (value) => setFrequency(value), children: [_jsxs("div", { className: "flex items-center space-x-2 mb-2", children: [_jsx(RadioGroupItem, { value: "monthly", id: "monthly" }), _jsx(Label, { htmlFor: "monthly", className: "cursor-pointer", children: "Monthly - Every month on this day" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(RadioGroupItem, { value: "yearly", id: "yearly" }), _jsx(Label, { htmlFor: "yearly", className: "cursor-pointer", children: "Yearly - Every year on this day" })] })] })] }), _jsxs("div", { className: "bg-muted rounded-lg p-4", children: [_jsxs("div", { className: "flex items-center gap-2 mb-2", children: [_jsx(Calendar, { className: "w-4 h-4 text-primary" }), _jsx("p", { className: "text-sm font-semibold", children: "Summary" })] }), _jsxs("p", { className: "text-sm text-muted-foreground mb-1", children: ["Investment: ", _jsx("span", { className: "font-semibold text-foreground", children: selectedInvestment?.name || 'Select one' })] }), _jsxs("p", { className: "text-sm text-muted-foreground mb-1", children: ["Amount: ", _jsxs("span", { className: "font-semibold text-foreground", children: ["$", amount] }), " ", frequency] }), _jsxs("p", { className: "text-sm text-muted-foreground", children: ["Next contribution: ", _jsx("span", { className: "font-semibold text-foreground", children: getNextContributionDate() })] })] }), _jsxs(Button, { onClick: handleSetupRecurring, disabled: !selectedInvestment || setupRecurringMutation.isPending, className: "w-full", children: [_jsx(RefreshCw, { className: "w-4 h-4 mr-2" }), setupRecurringMutation.isPending ? 'Setting Up...' : `Set Up ${frequency.charAt(0).toUpperCase() + frequency.slice(1)} Contribution`] }), _jsx("p", { className: "text-xs text-muted-foreground text-center", children: "You can cancel recurring contributions at any time from your profile." })] }))] })] }));
}
