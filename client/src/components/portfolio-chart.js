import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { User } from "lucide-react";
import { aggregateHoldingsByCategory } from "@/lib/investment-categories";
export default function PortfolioChart({ holdings, child }) {
    if (!holdings || holdings.length === 0) {
        return (_jsx("div", { className: "bg-card border border-border rounded-lg p-8 text-center", children: _jsx("p", { className: "text-muted-foreground", children: "No portfolio data to display" }) }));
    }
    const categoryData = aggregateHoldingsByCategory(holdings);
    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (_jsxs("div", { className: "bg-card border border-border rounded-lg p-2 shadow-lg", children: [_jsx("p", { className: "font-semibold", children: data.category }), _jsxs("p", { className: "text-sm text-muted-foreground", children: ["$", data.value.toFixed(2), " (", data.percentage.toFixed(1), "%)"] })] }));
        }
        return null;
    };
    return (_jsx("div", { className: "bg-card rounded-lg border border-border", children: _jsxs("div", { className: "p-6", children: [_jsxs("div", { className: "relative h-80", children: [_jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(PieChart, { children: [_jsx(Pie, { data: categoryData, cx: "50%", cy: "50%", innerRadius: 80, outerRadius: 120, dataKey: "value", stroke: "none", children: categoryData.map((entry, index) => (_jsx(Cell, { fill: entry.color }, `cell-${index}`))) }), _jsx(Tooltip, { content: _jsx(CustomTooltip, {}) })] }) }), _jsx("div", { className: "absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2", children: _jsx(Avatar, { className: "w-32 h-32 border-4 border-white shadow-lg", children: child?.profileImageUrl ? (_jsx(AvatarImage, { src: child.profileImageUrl, alt: child.firstName && child.lastName ? `${child.firstName} ${child.lastName}` : 'Child' })) : (_jsx(AvatarFallback, { className: "bg-muted", children: _jsx(User, { className: "w-16 h-16 text-muted-foreground" }) })) }) })] }), _jsx("div", { className: "mt-6 space-y-3", children: categoryData.map((item) => (_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("div", { className: "w-3 h-3 rounded-full flex-shrink-0", style: { backgroundColor: item.color } }), _jsx("span", { className: "text-sm font-medium", children: item.category }), _jsxs("span", { className: "text-sm text-muted-foreground", children: [item.percentage.toFixed(0), "%"] })] }), _jsxs("span", { className: "text-sm font-semibold", children: ["$", item.value.toFixed(2)] })] }, item.category))) })] }) }));
}
