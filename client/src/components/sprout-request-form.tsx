import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Send, Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SproutRequestFormProps {
  childId: string;
  childName: string;
}

export function SproutRequestForm({ childId, childName }: SproutRequestFormProps) {
  const { token } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    contributorName: '',
    contributorPhone: '',
    contributorEmail: '',
    message: '',
  });
  const [sproutLink, setSproutLink] = useState('');
  const [copied, setCopied] = useState(false);

  const createSproutRequestMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/sprout-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create sprout request');
      }

      return response.json();
    },
    onSuccess: (data) => {
      setSproutLink(data.sproutLink);
      toast({
        title: 'Sprout Request Sent!',
        description: `Contribution request sent to ${formData.contributorName}`,
      });
      setFormData({
        contributorName: '',
        contributorPhone: '',
        contributorEmail: '',
        message: '',
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.contributorName || !formData.contributorPhone) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    createSproutRequestMutation.mutate({
      childId,
      ...formData,
    });
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(sproutLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: 'Copied!',
      description: 'Link copied to clipboard',
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">
          <Send className="w-4 h-4 mr-2" />
          Send Sprout Request
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Request Contribution</DialogTitle>
        </DialogHeader>
        
        {!sproutLink ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Alert>
              <AlertDescription>
                Invite family or friends to contribute to {childName}'s investment account via SMS.
              </AlertDescription>
            </Alert>

            <div>
              <Label htmlFor="contributorName">Contributor Name *</Label>
              <Input
                id="contributorName"
                value={formData.contributorName}
                onChange={(e) => handleChange('contributorName', e.target.value)}
                placeholder="Enter contributor's name"
                required
              />
            </div>

            <div>
              <Label htmlFor="contributorPhone">Phone Number *</Label>
              <Input
                id="contributorPhone"
                type="tel"
                value={formData.contributorPhone}
                onChange={(e) => handleChange('contributorPhone', e.target.value)}
                placeholder="e.g., +1234567890"
                required
              />
            </div>

            <div>
              <Label htmlFor="contributorEmail">Email (Optional)</Label>
              <Input
                id="contributorEmail"
                type="email"
                value={formData.contributorEmail}
                onChange={(e) => handleChange('contributorEmail', e.target.value)}
                placeholder="Enter email address"
              />
            </div>

            <div>
              <Label htmlFor="message">Personal Message (Optional)</Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => handleChange('message', e.target.value)}
                placeholder="Add a personal message..."
                rows={3}
              />
            </div>

            <Button type="submit" className="w-full" disabled={createSproutRequestMutation.isPending}>
              {createSproutRequestMutation.isPending ? 'Sending...' : 'Send Request'}
            </Button>
          </form>
        ) : (
          <div className="space-y-4">
            <Alert>
              <AlertDescription>
                Sprout request created! The link has been sent via SMS (simulated).
              </AlertDescription>
            </Alert>

            <Card>
              <CardContent className="pt-4">
                <Label>Share this link:</Label>
                <div className="flex gap-2 mt-2">
                  <Input value={sproutLink} readOnly className="flex-1" />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={copyToClipboard}
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Button
              onClick={() => {
                setSproutLink('');
                setIsOpen(false);
              }}
              className="w-full"
            >
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
