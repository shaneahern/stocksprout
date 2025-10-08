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
    name: "Emma",
    age: 8,
    birthday: "March 15th",
    giftLinkCode: "FG-EMM-8BD",
    profileImageUrl: null
  },
  {
    id: "child-2", 
    parentId: "parent-1",
    name: "Alex",
    age: 14,
    birthday: "September 22nd",
    giftLinkCode: "FG-ALX-9CF",
    profileImageUrl: null
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
