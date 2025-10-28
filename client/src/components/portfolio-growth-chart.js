import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { useState, useMemo } from "react";
import { ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';
import { Button } from "@/components/ui/button";
export default function PortfolioGrowthChart({ currentValue, ytdReturn }) {
    const [selectedPeriod, setSelectedPeriod] = useState("All");
    const periods = ["1D", "1W", "1M", "3M", "YTD", "1Y", "All"];
    const chartData = useMemo(() => {
        const dataPoints = [];
        let numPoints = 30;
        let startDate = new Date();
        let timeIncrement; // Time increment in milliseconds
        switch (selectedPeriod) {
            case "1D":
                numPoints = 96; // 15-minute intervals for 1 day (96 points = 24 hours * 4 intervals per hour)
                timeIncrement = 15 * 60 * 1000; // 15 minutes in milliseconds
                startDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
                break;
            case "1W":
                numPoints = 28; // 6-hour intervals for 1 week (28 points = 7 days * 4 intervals per day)
                timeIncrement = 6 * 60 * 60 * 1000; // 6 hours in milliseconds
                startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                break;
            case "1M":
                numPoints = 30; // Daily data for 1 month
                timeIncrement = 24 * 60 * 60 * 1000; // 1 day in milliseconds
                startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
                break;
            case "3M":
                numPoints = 90; // Daily data for 3 months
                timeIncrement = 24 * 60 * 60 * 1000; // 1 day in milliseconds
                startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
                break;
            case "YTD":
                const yearStart = new Date(new Date().getFullYear(), 0, 1);
                const daysSinceYearStart = Math.floor((Date.now() - yearStart.getTime()) / (24 * 60 * 60 * 1000));
                numPoints = Math.min(daysSinceYearStart, 365); // Weekly data for YTD
                timeIncrement = 7 * 24 * 60 * 60 * 1000; // 1 week in milliseconds
                startDate = yearStart;
                break;
            case "1Y":
                numPoints = 52; // Weekly data for 1 year
                timeIncrement = 7 * 24 * 60 * 60 * 1000; // 1 week in milliseconds
                startDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
                break;
            case "All":
                numPoints = 104; // Bi-weekly data for all time (2+ years)
                timeIncrement = 14 * 24 * 60 * 60 * 1000; // 2 weeks in milliseconds
                startDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
                break;
        }
        const totalGrowthFactor = 1 + (ytdReturn / 100);
        const baseValue = currentValue / totalGrowthFactor;
        // Generate data with appropriate granularity and volatility for each timeframe
        let previousValue = baseValue;
        let trend = 0; // Running trend to make data smoother
        // Adjust volatility based on timeframe - more realistic ups and downs
        let baseVolatility;
        switch (selectedPeriod) {
            case "1D":
                baseVolatility = 0.008; // Lower volatility for 15-minute data
                break;
            case "1W":
                baseVolatility = 0.012; // Slightly higher for 6-hour data
                break;
            case "1M":
            case "3M":
                baseVolatility = 0.018; // Medium volatility for daily data
                break;
            case "YTD":
            case "1Y":
                baseVolatility = 0.025; // Higher volatility for weekly data
                break;
            case "All":
                baseVolatility = 0.03; // Highest volatility for bi-weekly data
                break;
            default:
                baseVolatility = 0.025;
        }
        for (let i = 0; i <= numPoints; i++) {
            // Use time increment for precise time calculations
            const timeMs = startDate.getTime() + (i * timeIncrement);
            const date = new Date(timeMs);
            // Calculate the target value based on growth
            const progressRatio = i / numPoints;
            const targetValue = baseValue * (1 + (ytdReturn / 100) * progressRatio);
            // Add more realistic volatility with both positive and negative movements
            const randomMove = (Math.random() - 0.5) * 2; // Range from -1 to 1
            const volatility = randomMove * baseVolatility;
            // Create more realistic momentum - sometimes trending up, sometimes down
            const momentumFactor = Math.sin(i / numPoints * Math.PI * 4) * 0.3; // Creates cyclical momentum
            trend = trend * 0.3 + volatility * 0.7; // Less smoothing for more realistic movements
            // Calculate new value with more realistic market behavior
            const marketNoise = (Math.random() - 0.5) * baseVolatility * 0.5;
            const value = previousValue * (1 + trend + volatility * 0.6 + marketNoise + momentumFactor * 0.1);
            // Allow more deviation from target to create realistic market movements
            const deviation = (value - targetValue) / targetValue;
            if (Math.abs(deviation) > 0.15) { // Max 15% deviation from target (increased from 5%)
                // Pull back towards target but not too aggressively
                const pullbackStrength = 0.3;
                previousValue = previousValue * (1 - pullbackStrength) + targetValue * pullbackStrength;
            }
            else {
                previousValue = value;
            }
            // Format date based on timeframe
            let dateStr;
            if (selectedPeriod === "1D") {
                dateStr = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
            }
            else if (selectedPeriod === "1W") {
                // For 6-hour intervals, show time and day
                const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                const time = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                dateStr = `${dayName} ${time}`;
            }
            else if (["1M", "3M"].includes(selectedPeriod)) {
                dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            }
            else {
                // For YTD, 1Y, All - show month and day
                dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            }
            dataPoints.push({
                date: dateStr,
                value: Math.max(0, previousValue),
            });
        }
        return dataPoints;
    }, [currentValue, ytdReturn, selectedPeriod]);
    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (_jsxs("div", { className: "bg-card border border-border rounded-lg p-2 shadow-lg", children: [_jsxs("p", { className: "text-sm font-semibold", children: ["$", payload[0].value.toFixed(2)] }), _jsx("p", { className: "text-xs text-muted-foreground", children: payload[0].payload.date })] }));
        }
        return null;
    };
    const values = chartData.map(d => d.value);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const padding = Math.max((maxValue - minValue) * 0.1, 50); // Ensure minimum padding
    // Calculate even increments for Y-axis
    const calculateEvenIncrements = (min, max) => {
        const range = max - min;
        let increment;
        let ticks = [];
        if (range <= 1000) {
            // For small ranges, use $5K increments
            increment = 5000;
            const startTick = Math.floor(min / increment) * increment;
            const endTick = Math.ceil(max / increment) * increment;
            for (let i = startTick; i <= endTick; i += increment) {
                ticks.push(i);
            }
        }
        else if (range <= 10000) {
            // For medium ranges, use $10K increments
            increment = 10000;
            const startTick = Math.floor(min / increment) * increment;
            const endTick = Math.ceil(max / increment) * increment;
            for (let i = startTick; i <= endTick; i += increment) {
                ticks.push(i);
            }
        }
        else {
            // For large ranges, use $10K increments
            increment = 10000;
            const startTick = Math.floor(min / increment) * increment;
            const endTick = Math.ceil(max / increment) * increment;
            for (let i = startTick; i <= endTick; i += increment) {
                ticks.push(i);
            }
        }
        return {
            ticks,
            domain: [Math.min(...ticks), Math.max(...ticks)]
        };
    };
    const yAxisConfig = calculateEvenIncrements(minValue, maxValue);
    return (_jsx("div", { className: "bg-card rounded-lg", children: _jsxs("div", { className: "px-0 py-1", children: [_jsx("div", { className: "h-48 mb-0", children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(ComposedChart, { data: chartData, margin: { top: 5, right: 10, left: -10, bottom: 5 }, children: [_jsx("defs", { children: _jsxs("linearGradient", { id: "portfolioGradient", x1: "0", y1: "0", x2: "0", y2: "1", children: [_jsx("stop", { offset: "5%", stopColor: "hsl(120, 50%, 35%)", stopOpacity: 0.8 }), _jsx("stop", { offset: "95%", stopColor: "hsl(120, 50%, 35%)", stopOpacity: 0.1 })] }) }), _jsx(CartesianGrid, { strokeDasharray: "1 1", stroke: "#d1d5db", horizontal: true, vertical: false, strokeWidth: 1.5, strokeOpacity: 1 }), _jsx(XAxis, { dataKey: "date", tick: { fill: 'hsl(var(--muted-foreground))', fontSize: 12 }, tickLine: false, axisLine: false }), _jsx(YAxis, { tick: { fill: 'hsl(var(--muted-foreground))', fontSize: 12 }, tickLine: false, axisLine: false, domain: yAxisConfig.domain, ticks: yAxisConfig.ticks, tickFormatter: (value) => {
                                        if (value >= 1000) {
                                            return `$${(value / 1000).toFixed(0)}K`;
                                        }
                                        else {
                                            return `$${value.toFixed(0)}`;
                                        }
                                    } }), _jsx(Tooltip, { content: _jsx(CustomTooltip, {}) }), _jsx(Line, { type: "monotone", dataKey: "value", stroke: "hsl(120, 50%, 35%)", strokeWidth: 3, dot: false, activeDot: { r: 6 } }), _jsx(Area, { type: "monotone", dataKey: "value", stroke: "none", fill: "url(#portfolioGradient)", fillOpacity: 0.6, connectNulls: false })] }, `chart-${Date.now()}`) }) }), _jsx("div", { className: "flex items-center justify-center gap-1", children: periods.map((period) => (_jsx(Button, { variant: selectedPeriod === period ? "default" : "ghost", size: "sm", onClick: () => setSelectedPeriod(period), className: `text-xs font-medium px-2 py-1 ${selectedPeriod === period
                            ? "bg-foreground text-background"
                            : "text-muted-foreground hover:text-foreground"}`, children: period }, period))) })] }) }));
}
