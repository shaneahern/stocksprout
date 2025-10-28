import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Building2 } from "lucide-react";
import { getStockLogoUrl, getFallbackLogoUrl } from "@/lib/stock-logo";
export default function BrokerageTransferSelector({ selectedInvestment, selectedShares, onSelectInvestment, onSharesChange }) {
    // Simulated brokerage account holdings
    const brokerageHoldings = [
        {
            investment: {
                id: "temp-AAPL",
                symbol: "AAPL",
                name: "Apple Inc.",
                type: "stock",
                currentPrice: "175.23",
                ytdReturn: "45.2"
            },
            availableShares: 10.5,
            averageCost: "152.30",
            currentValue: "1839.92"
        },
        {
            investment: {
                id: "temp-TSLA",
                symbol: "TSLA",
                name: "Tesla, Inc.",
                type: "stock",
                currentPrice: "242.15",
                ytdReturn: "32.8"
            },
            availableShares: 5,
            averageShares: 3.2,
            averageCost: "198.50",
            currentValue: "1210.75"
        },
        {
            investment: {
                id: "temp-VTI",
                symbol: "VTI",
                name: "Vanguard Total Stock Market ETF",
                type: "etf",
                currentPrice: "248.67",
                ytdReturn: "28.5"
            },
            availableShares: 25,
            averageCost: "220.15",
            currentValue: "6216.75"
        },
        {
            investment: {
                id: "temp-GOOGL",
                symbol: "GOOGL",
                name: "Alphabet Inc.",
                type: "stock",
                currentPrice: "142.85",
                ytdReturn: "38.9"
            },
            availableShares: 7.25,
            averageCost: "125.40",
            currentValue: "1035.66"
        },
        {
            investment: {
                id: "temp-SPY",
                symbol: "SPY",
                name: "SPDR S&P 500 ETF Trust",
                type: "etf",
                currentPrice: "455.82",
                ytdReturn: "26.3"
            },
            availableShares: 12,
            averageCost: "425.90",
            currentValue: "5469.84"
        }
    ];
    const handleImageError = (e, symbol) => {
        const target = e.currentTarget;
        if (!target.src.startsWith('data:')) {
            target.src = getFallbackLogoUrl(symbol);
        }
    };
    const selectedHolding = brokerageHoldings.find(h => h.investment.id === selectedInvestment?.id);
    const handleSharesInputChange = (newShares) => {
        // Allow empty string for clearing
        if (newShares === "") {
            onSharesChange("");
            return;
        }
        const sharesNum = parseFloat(newShares);
        // Validate against available shares
        if (selectedHolding && sharesNum > selectedHolding.availableShares) {
            // Clamp to maximum available
            onSharesChange(selectedHolding.availableShares.toString());
            return;
        }
        onSharesChange(newShares);
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center space-x-3 p-4 bg-primary/5 border border-primary/20 rounded-lg", children: [_jsx(Building2, { className: "w-6 h-6 text-primary" }), _jsxs("div", { children: [_jsx("h4", { className: "font-semibold text-foreground", children: "Connected Brokerage Account" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Fidelity Investments \u2022\u2022\u2022\u20221234 (Simulated)" })] })] }), _jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold mb-4", children: "Available Holdings" }), _jsx("div", { className: "space-y-3", children: brokerageHoldings.map((holding) => (_jsx(Card, { className: `cursor-pointer transition-all hover:shadow-md ${selectedInvestment?.id === holding.investment.id
                                ? 'border-primary bg-primary/5'
                                : 'border-border hover:border-primary/50'}`, onClick: () => onSelectInvestment(holding.investment), "data-testid": `brokerage-holding-${holding.investment.symbol}`, children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-start space-x-3", children: [_jsx("div", { className: "w-12 h-12 rounded-lg flex items-center justify-center overflow-hidden bg-muted flex-shrink-0", children: _jsx("img", { src: getStockLogoUrl(holding.investment.symbol, holding.investment.name), alt: `${holding.investment.symbol} logo`, className: "w-full h-full object-contain", onError: (e) => handleImageError(e, holding.investment.symbol) }) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsxs("div", { className: "flex items-start justify-between mb-2", children: [_jsxs("div", { className: "min-w-0", children: [_jsx("h4", { className: "font-bold text-foreground", children: holding.investment.symbol }), _jsx("p", { className: "text-sm text-muted-foreground truncate", children: holding.investment.name })] }), _jsx(Badge, { variant: "secondary", className: "capitalize text-xs ml-2", children: holding.investment.type })] }), _jsxs("div", { className: "grid grid-cols-2 gap-3 text-sm", children: [_jsxs("div", { children: [_jsx("p", { className: "text-muted-foreground", children: "Available Shares" }), _jsx("p", { className: "font-semibold text-foreground", children: holding.availableShares })] }), _jsxs("div", { children: [_jsx("p", { className: "text-muted-foreground", children: "Current Price" }), _jsxs("p", { className: "font-semibold text-foreground", children: ["$", parseFloat(holding.investment.currentPrice).toFixed(2)] })] }), _jsxs("div", { children: [_jsx("p", { className: "text-muted-foreground", children: "Current Value" }), _jsxs("p", { className: "font-semibold text-foreground", children: ["$", holding.currentValue] })] }), _jsxs("div", { className: "flex items-center space-x-1", children: [_jsx(TrendingUp, { className: "w-3 h-3 text-success" }), _jsxs("p", { className: "text-sm font-semibold text-success", children: ["+", holding.investment.ytdReturn, "% YTD"] })] })] }), selectedInvestment?.id === holding.investment.id && (_jsxs("div", { className: "mt-3 flex items-center space-x-2", children: [_jsx("div", { className: "w-2 h-2 bg-primary rounded-full" }), _jsx("span", { className: "text-primary text-sm font-medium", children: "Selected" })] }))] })] }) }) }, holding.investment.id))) })] }), selectedInvestment && selectedHolding && (_jsx(Card, { className: "border-primary bg-primary/5", children: _jsxs(CardContent, { className: "p-6", children: [_jsx("h4", { className: "font-semibold text-foreground mb-4", children: "Transfer Amount" }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-semibold text-foreground mb-2", children: "Number of Shares to Transfer" }), _jsx(Input, { type: "number", value: selectedShares, onChange: (e) => handleSharesInputChange(e.target.value), className: "text-2xl font-bold h-12", min: "0.0001", max: selectedHolding.availableShares, step: "0.0001", placeholder: "0.0000", "data-testid": "input-transfer-shares" }), _jsxs("p", { className: "text-sm text-muted-foreground mt-2", children: ["Maximum: ", selectedHolding.availableShares, " shares available"] })] }), selectedShares && parseFloat(selectedShares) > 0 && (_jsxs("div", { className: "p-4 bg-background rounded-lg border border-border", children: [_jsx("h5", { className: "font-semibold text-foreground mb-2", children: "Transfer Summary" }), _jsxs("div", { className: "space-y-2 text-sm", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-muted-foreground", children: "Shares to Transfer:" }), _jsx("span", { className: "font-semibold text-foreground", children: selectedShares })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-muted-foreground", children: "Current Value:" }), _jsxs("span", { className: "font-semibold text-foreground", children: ["$", (parseFloat(selectedShares) * parseFloat(selectedInvestment.currentPrice)).toFixed(2)] })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-muted-foreground", children: "Remaining Shares:" }), _jsx("span", { className: "font-semibold text-foreground", children: (selectedHolding.availableShares - parseFloat(selectedShares)).toFixed(4) })] })] })] }))] })] }) }))] }));
}
