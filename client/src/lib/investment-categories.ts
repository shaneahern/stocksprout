import type { Investment } from "@shared/schema";

export type InvestmentCategory = 
  | "Technology" 
  | "Domestic" 
  | "Foreign" 
  | "Short Term" 
  | "Crypto"
  | "Unknown";

export const CATEGORY_COLORS = {
  Technology: "hsl(158, 64%, 52%)",
  Domestic: "hsl(0, 84%, 60%)",
  Foreign: "hsl(221, 83%, 70%)",
  "Short Term": "hsl(38, 92%, 50%)",
  Crypto: "hsl(221, 83%, 53%)",
  Unknown: "hsl(215, 16%, 47%)",
} as const;

export function getInvestmentCategory(investment: Investment): InvestmentCategory {
  const symbol = investment.symbol.toUpperCase();
  
  if (['AAPL', 'MSFT', 'GOOGL', 'TSLA'].includes(symbol)) {
    return "Technology";
  }
  
  if (['SPY', 'VTI', 'QQQ'].includes(symbol)) {
    return "Domestic";
  }
  
  if (['VIG'].includes(symbol)) {
    return "Short Term";
  }
  
  if (['BTC', 'ETH'].includes(symbol) || investment.type === 'crypto') {
    return "Crypto";
  }
  
  return "Unknown";
}

export function aggregateHoldingsByCategory(holdings: any[]) {
  const categoryTotals = new Map<InvestmentCategory, number>();
  
  holdings.forEach(holding => {
    if (!holding.investment) return;
    
    const category = getInvestmentCategory(holding.investment);
    const value = parseFloat(holding.currentValue || "0");
    
    categoryTotals.set(
      category,
      (categoryTotals.get(category) || 0) + value
    );
  });
  
  const totalValue = Array.from(categoryTotals.values()).reduce((sum, val) => sum + val, 0);
  
  return Array.from(categoryTotals.entries()).map(([category, value]) => ({
    category,
    value,
    percentage: totalValue > 0 ? (value / totalValue) * 100 : 0,
    color: CATEGORY_COLORS[category],
  }));
}
