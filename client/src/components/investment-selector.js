import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, TrendingUp } from "lucide-react";
import { getStockLogoUrl, getFallbackLogoUrl } from "@/lib/stock-logo";
export default function InvestmentSelector({ selectedInvestment, onSelectInvestment }) {
    const [searchQuery, setSearchQuery] = useState("");
    const { data: investments = [] } = useQuery({
        queryKey: ["/api/investments"],
    });
    const { data: searchResults = [] } = useQuery({
        queryKey: ["/api/investments/search", searchQuery],
        queryFn: async () => {
            const response = await fetch(`/api/investments/search?q=${encodeURIComponent(searchQuery)}`);
            if (!response.ok)
                throw new Error('Search failed');
            return response.json();
        },
        enabled: searchQuery.length > 2,
    });
    // Deduplicate popular investments by ID or symbol
    const deduplicatedPopular = investments
        .filter((inv, index, self) => {
        const firstIndex = self.findIndex(i => (i.id === inv.id && inv.id) || (i.symbol === inv.symbol));
        return index === firstIndex;
    })
        .slice(0, 6);
    // Create a Set of popular investment identifiers for fast lookup
    const popularIdentifiers = new Set();
    deduplicatedPopular.forEach(inv => {
        if (inv.id)
            popularIdentifiers.add(inv.id);
        popularIdentifiers.add(inv.symbol);
    });
    // Deduplicate search results by ID or symbol
    // Also remove any that are already in popular investments
    const deduplicatedSearchResults = searchResults
        .filter((inv, index, self) => {
        const firstIndex = self.findIndex(i => (i.id === inv.id && inv.id) || (i.symbol === inv.symbol));
        return index === firstIndex;
    })
        .filter(inv => {
        // Remove if it's already in popular investments (match by ID or symbol)
        const isInPopular = (inv.id && popularIdentifiers.has(inv.id)) ||
            popularIdentifiers.has(inv.symbol);
        return !isInPopular;
    });
    const popularInvestments = deduplicatedPopular;
    const displayInvestments = searchQuery.length > 2 ? deduplicatedSearchResults : popularInvestments;
    const handleImageError = (e, symbol) => {
        const target = e.currentTarget;
        // Prevent infinite loop if fallback also fails
        if (!target.src.startsWith('data:')) {
            target.src = getFallbackLogoUrl(symbol);
        }
    };
    const handleSelectInvestment = (investment) => {
        onSelectInvestment(investment);
        setSearchQuery("");
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold mb-4", children: "Popular Choices" }), _jsx("div", { className: "grid grid-cols-2 md:grid-cols-3 gap-4", children: popularInvestments.map((investment) => (_jsx(Card, { className: `cursor-pointer transition-all hover:shadow-md ${selectedInvestment?.id === investment.id
                                ? 'border-primary bg-primary/5'
                                : 'border-border hover:border-primary/50'}`, onClick: () => handleSelectInvestment(investment), "data-testid": `card-investment-${investment.symbol}`, children: _jsxs(CardContent, { className: "p-4", children: [_jsxs("div", { className: "flex items-center space-x-3 mb-3", children: [_jsx("div", { className: "w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden bg-muted", children: _jsx("img", { src: getStockLogoUrl(investment.symbol, investment.name), alt: `${investment.symbol} logo`, className: "w-full h-full object-contain", onError: (e) => handleImageError(e, investment.symbol) }) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("h4", { className: "font-bold text-foreground truncate", children: investment.symbol }), _jsx("p", { className: "text-sm text-muted-foreground truncate", children: investment.name })] })] }), _jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsxs("span", { className: "text-sm text-muted-foreground", children: ["$", parseFloat(investment.currentPrice).toFixed(2)] }), _jsx(Badge, { variant: "secondary", className: "capitalize text-xs", children: investment.type })] }), _jsxs("div", { className: "flex items-center space-x-1", children: [_jsx(TrendingUp, { className: "w-3 h-3 text-success" }), _jsxs("span", { className: "text-sm font-semibold text-success", children: ["+", investment.ytdReturn, "% YTD"] })] }), selectedInvestment?.id === investment.id && (_jsxs("div", { className: "mt-3 flex items-center space-x-2", children: [_jsx("div", { className: "w-2 h-2 bg-primary rounded-full" }), _jsx("span", { className: "text-primary text-sm font-medium", children: "Selected" })] }))] }) }, investment.id))) })] }), _jsxs("div", { className: "border-t border-border pt-6", children: [_jsx("div", { className: "mb-4", children: _jsx("h3", { className: "text-lg font-semibold", children: "Search for Specific Investment" }) }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "relative", children: [_jsx(Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" }), _jsx(Input, { value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), placeholder: "Search stocks, ETFs, or funds...", className: "pl-10", "data-testid": "input-investment-search" })] }), searchQuery.length > 2 && (_jsxs("div", { className: "grid grid-cols-1 gap-2 max-h-60 overflow-y-auto", children: [searchResults.map((investment) => (_jsx(Card, { className: `cursor-pointer transition-all ${selectedInvestment?.id === investment.id
                                            ? 'border-primary bg-primary/5'
                                            : 'border-border hover:border-primary/50'}`, onClick: () => handleSelectInvestment(investment), "data-testid": `search-result-${investment.symbol}`, children: _jsxs(CardContent, { className: "p-3", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("div", { className: "w-8 h-8 rounded flex items-center justify-center overflow-hidden bg-muted flex-shrink-0", children: _jsx("img", { src: getStockLogoUrl(investment.symbol, investment.name), alt: `${investment.symbol} logo`, className: "w-full h-full object-contain", onError: (e) => handleImageError(e, investment.symbol) }) }), _jsxs("div", { children: [_jsx("h4", { className: "font-semibold", children: investment.symbol }), _jsx("p", { className: "text-sm text-muted-foreground", children: investment.name })] })] }), _jsxs("div", { className: "text-right", children: [_jsxs("p", { className: "font-semibold", children: ["$", parseFloat(investment.currentPrice).toFixed(2)] }), _jsxs("p", { className: "text-sm text-success", children: ["+", investment.ytdReturn, "%"] })] })] }), selectedInvestment?.id === investment.id && (_jsxs("div", { className: "mt-3 flex items-center space-x-2", children: [_jsx("div", { className: "w-2 h-2 bg-primary rounded-full" }), _jsx("span", { className: "text-primary text-sm font-medium", children: "Selected" })] }))] }) }, investment.id))), searchResults.length === 0 && (_jsxs("p", { className: "text-center text-muted-foreground py-4", children: ["No investments found for \"", searchQuery, "\""] }))] }))] })] })] }));
}
