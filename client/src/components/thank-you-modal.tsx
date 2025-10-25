import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface ThankYouModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (message: string) => void;
  giftGiverName?: string;
}

export function ThankYouModal({ isOpen, onClose, onSend, giftGiverName }: ThankYouModalProps) {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim()) {
      onSend(message);
      setMessage(''); // Reset message after sending
      onClose();
    }
  };

  const handleCancel = () => {
    setMessage(''); // Reset message on cancel
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            Say Thanks{giftGiverName ? ` to ${giftGiverName}` : ''}
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <Textarea
            placeholder="Write a thank you message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="min-h-[120px]"
            autoFocus
          />
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleCancel}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSend}
            disabled={!message.trim()}
          >
            Send
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
