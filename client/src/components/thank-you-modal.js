import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
export function ThankYouModal({ isOpen, onClose, onSend, giftGiverName }) {
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
    return (_jsx(Dialog, { open: isOpen, onOpenChange: handleCancel, children: _jsxs(DialogContent, { className: "max-w-md", children: [_jsx(DialogHeader, { children: _jsxs(DialogTitle, { children: ["Say Thanks", giftGiverName ? ` to ${giftGiverName}` : ''] }) }), _jsx("div", { className: "py-4", children: _jsx(Textarea, { placeholder: "Write a thank you message...", value: message, onChange: (e) => setMessage(e.target.value), className: "min-h-[120px]", autoFocus: true }) }), _jsxs(DialogFooter, { children: [_jsx(Button, { variant: "outline", onClick: handleCancel, children: "Cancel" }), _jsx(Button, { onClick: handleSend, disabled: !message.trim(), children: "Send" })] })] }) }));
}
