import type { Investment } from "@shared/schema";
export type InvestmentCategory = "Technology" | "Domestic" | "Foreign" | "Short Term" | "Crypto" | "Unknown";
export declare const CATEGORY_COLORS: {
    readonly Technology: "hsl(158, 64%, 52%)";
    readonly Domestic: "hsl(0, 84%, 60%)";
    readonly Foreign: "hsl(221, 83%, 70%)";
    readonly "Short Term": "hsl(38, 92%, 50%)";
    readonly Crypto: "hsl(221, 83%, 53%)";
    readonly Unknown: "hsl(215, 16%, 47%)";
};
export declare function getInvestmentCategory(investment: Investment): InvestmentCategory;
export declare function aggregateHoldingsByCategory(holdings: any[]): {
    category: InvestmentCategory;
    value: number;
    percentage: number;
    color: "hsl(158, 64%, 52%)" | "hsl(0, 84%, 60%)" | "hsl(221, 83%, 70%)" | "hsl(38, 92%, 50%)" | "hsl(221, 83%, 53%)" | "hsl(215, 16%, 47%)";
}[];
