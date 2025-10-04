export function generateGiftLink(childCode: string): string {
  const baseUrl = import.meta.env.VITE_APP_URL || window.location.origin;
  return `${baseUrl}/gift/${childCode}`;
}

export function generateSMSMessage(childName: string, giftLink: string): string {
  return `🎁 You've been invited to send an investment gift to ${childName}! Click here to choose and send your gift: ${giftLink}`;
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text);
}

export function shareViaWebShare(data: { title: string; text: string; url: string }): Promise<void> {
  if (navigator.share) {
    return navigator.share(data);
  } else {
    // Fallback to clipboard
    return copyToClipboard(data.url);
  }
}
