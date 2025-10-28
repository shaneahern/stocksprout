export declare const mockInvestments: {
    id: string;
    symbol: string;
    name: string;
    type: string;
    currentPrice: string;
    ytdReturn: string;
}[];
export declare const mockChildren: {
    id: string;
    parentId: string;
    name: string;
    age: number;
    birthday: string;
    giftLinkCode: string;
    profileImageUrl: null;
    financialJourneyStage: string;
    progress: {
        points: number;
        level: number;
        gamesPlayed: number;
        achievements: number;
        badgesEarned: number;
    };
}[];
export declare const mockGifts: {
    id: string;
    childId: string;
    giftGiverName: string;
    giftGiverEmail: string;
    investmentId: string;
    amount: string;
    shares: string;
    message: string;
    videoMessageUrl: null;
    createdAt: Date;
    isViewed: boolean;
    thankYouSent: boolean;
}[];
