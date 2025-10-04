import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calendar, RefreshCw, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface RecurringContributionSetupProps {
  childId: string;
  childName: string;
  selectedInvestment: any;
  amount: string;
  contributorName: string;
  contributorEmail: string;
}

export function RecurringContributionSetup({
  childId,
  childName,
  selectedInvestment,
  amount,
  contributorName,
  contributorEmail,
}: RecurringContributionSetupProps) {
  const { toast } = useToast();
  const [enableRecurring, setEnableRecurring] = useState(false);
  const [frequency, setFrequency] = useState<'monthly' | 'yearly'>('monthly');

  const setupRecurringMutation = useMutation({
    mutationFn: async (data: any) => {
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
    onError: (error: Error) => {
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
    } else {
      const next = new Date(now);
      next.setFullYear(next.getFullYear() + 1);
      return next.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    }
  };

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <RefreshCw className="w-5 h-5 text-primary" />
          Set Up Recurring Contribution
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Info className="w-4 h-4" />
          <AlertDescription>
            Make this contribution recurring to automatically invest in {childName}'s future every month or year.
          </AlertDescription>
        </Alert>

        <div className="flex items-center justify-between">
          <Label htmlFor="enable-recurring" className="text-base font-semibold">
            Enable Recurring Contributions
          </Label>
          <Switch
            id="enable-recurring"
            checked={enableRecurring}
            onCheckedChange={setEnableRecurring}
          />
        </div>

        {enableRecurring && (
          <div className="space-y-4 pl-4 border-l-2 border-primary">
            <div>
              <Label className="text-sm font-semibold mb-3 block">Frequency</Label>
              <RadioGroup value={frequency} onValueChange={(value) => setFrequency(value as 'monthly' | 'yearly')}>
                <div className="flex items-center space-x-2 mb-2">
                  <RadioGroupItem value="monthly" id="monthly" />
                  <Label htmlFor="monthly" className="cursor-pointer">
                    Monthly - Every month on this day
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yearly" id="yearly" />
                  <Label htmlFor="yearly" className="cursor-pointer">
                    Yearly - Every year on this day
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="bg-muted rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-primary" />
                <p className="text-sm font-semibold">Summary</p>
              </div>
              <p className="text-sm text-muted-foreground mb-1">
                Investment: <span className="font-semibold text-foreground">{selectedInvestment?.name || 'Select one'}</span>
              </p>
              <p className="text-sm text-muted-foreground mb-1">
                Amount: <span className="font-semibold text-foreground">${amount}</span> {frequency}
              </p>
              <p className="text-sm text-muted-foreground">
                Next contribution: <span className="font-semibold text-foreground">{getNextContributionDate()}</span>
              </p>
            </div>

            <Button
              onClick={handleSetupRecurring}
              disabled={!selectedInvestment || setupRecurringMutation.isPending}
              className="w-full"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              {setupRecurringMutation.isPending ? 'Setting Up...' : `Set Up ${frequency.charAt(0).toUpperCase() + frequency.slice(1)} Contribution`}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              You can cancel recurring contributions at any time from your profile.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
