export const mockInvestments = [
    {
        id: "inv-1",
        symbol: "SPY",
        name: "S&P 500 ETF",
        type: "etf",
        currentPrice: "445.20",
        ytdReturn: "45.2"
    },
    {
        id: "inv-2",
        symbol: "BTC",
        name: "Bitcoin",
        type: "crypto",
        currentPrice: "43250.00",
        ytdReturn: "78.5"
    },
    {
        id: "inv-3",
        symbol: "TSLA",
        name: "Tesla Inc",
        type: "stock",
        currentPrice: "241.50",
        ytdReturn: "62.3"
    },
    {
        id: "inv-4",
        symbol: "AAPL",
        name: "Apple Inc",
        type: "stock",
        currentPrice: "189.95",
        ytdReturn: "38.7"
    },
    {
        id: "inv-5",
        symbol: "GOOGL",
        name: "Alphabet Inc",
        type: "stock",
        currentPrice: "142.65",
        ytdReturn: "55.8"
    }
];
export const mockChildren = [
    {
        id: "child-1",
        parentId: "parent-1",
        name: "Blaise",
        age: 8,
        birthday: "March 15th",
        giftLinkCode: "FG-EMM-8BD",
        profileImageUrl: null,
        financialJourneyStage: "savings",
        progress: {
            points: 1200,
            level: 3,
            gamesPlayed: 5,
            achievements: 2,
            badgesEarned: 3
        }
    },
    {
        id: "child-2",
        parentId: "parent-1",
        name: "Finn",
        age: 12,
        birthday: "July 10th",
        giftLinkCode: "FG-FIN-7AH",
        profileImageUrl: null,
        financialJourneyStage: "compound-interest",
        progress: {
            points: 2200,
            level: 5,
            gamesPlayed: 8,
            achievements: 6,
            badgesEarned: 4
        }
    }
];
export const mockGifts = [
    {
        id: "gift-1",
        childId: "child-1",
        giftGiverName: "Grandma Rose",
        giftGiverEmail: "rose@email.com",
        investmentId: "inv-3",
        amount: "150.00",
        shares: "0.6211",
        message: "Happy 8th birthday, Emma! This is for your bright future! 🚗✨",
        videoMessageUrl: null,
        createdAt: new Date("2024-01-15"),
        isViewed: false,
        thankYouSent: false
    }
];
