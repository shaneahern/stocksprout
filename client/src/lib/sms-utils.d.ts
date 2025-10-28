export declare function generateGiftLink(childCode: string): string;
export declare function generateSMSMessage(childName: string, giftLink: string): string;
export declare function copyToClipboard(text: string): Promise<void>;
export declare function shareViaWebShare(data: {
    title: string;
    text: string;
    url: string;
}): Promise<void>;
