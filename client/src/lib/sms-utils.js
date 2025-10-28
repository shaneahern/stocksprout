export function generateGiftLink(childCode) {
    const baseUrl = import.meta.env.VITE_APP_URL || window.location.origin;
    return `${baseUrl}/gift/${childCode}`;
}
export function generateSMSMessage(childName, giftLink) {
    return `🎁 You've been invited to send an investment gift to ${childName}! Click the link to choose and send your gift.`;
}
export function copyToClipboard(text) {
    return navigator.clipboard.writeText(text);
}
export function shareViaWebShare(data) {
    if (navigator.share) {
        return navigator.share(data);
    }
    else {
        // Fallback to clipboard
        return copyToClipboard(data.url);
    }
}
