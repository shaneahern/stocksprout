import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import MobileLayout from '@/components/mobile-layout';
import { Card, CardContent } from '@/components/ui/card';
import { ChildSelector } from '@/components/child-selector';
import JourneyGraphic from '@/components/journey-graphic';
import { Medal, MapPin, Building2, ArrowUpRight, Layers, DollarSign, Flag } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
export default function Activities() {
    const { user, token } = useAuth();
    const [selectedChildId, setSelectedChildId] = useState(null);
    // Journey stages configuration - positioned on the S-shaped path
    const journeyStages = [
        {
            id: "game-on",
            name: "Game On",
            icon: _jsx(MapPin, { className: "w-4 h-4" }),
            color: "#F97316", // Orange
            position: { x: 80, y: 250 } // Moved to match shorter bottom line
        },
        {
            id: "savings",
            name: "Savings",
            icon: _jsx(Building2, { className: "w-4 h-4" }),
            color: "#8B4513", // Brown
            position: { x: 260, y: 250 } // Moved a little more to the left
        },
        {
            id: "compound-interest",
            name: "Compound Interest",
            icon: _jsx(ArrowUpRight, { className: "w-4 h-4" }),
            color: "#DC2626", // Red
            position: { x: 120, y: 150 } // Moved a little more to the right
        },
        {
            id: "cash-flow",
            name: "Cash Flow",
            icon: _jsx(DollarSign, { className: "w-4 h-4" }),
            color: "#2563EB", // Blue
            position: { x: 280, y: 150 } // Middle horizontal line on the right
        },
        {
            id: "investing",
            name: "Investing",
            icon: _jsx(Layers, { className: "w-4 h-4" }),
            color: "#8B5CF6", // Purple
            position: { x: 120, y: 50 } // Moved a little more to the right
        },
        {
            id: "level-1-complete",
            name: "Level 1 Complete",
            icon: _jsx(Flag, { className: "w-4 h-4" }),
            color: "#16A34A", // Green
            position: { x: 320, y: 50 } // Moved to match adjusted top line
        }
    ];
    // Fetch custodian's children (children where user is parent)
    const { data: userChildren = [] } = useQuery({
        queryKey: ["/api/children", user?.id],
        enabled: !!user?.id,
    });
    // Fetch children that user has contributed to (gifts they've given)
    const { data: contributorGifts = [] } = useQuery({
        queryKey: ["/api/contributors/gifts", user?.id],
        queryFn: async () => {
            if (!user?.id || !token)
                return [];
            const response = await fetch(`/api/contributors/${user.id}/gifts`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            if (!response.ok)
                return [];
            return response.json();
        },
        enabled: !!user?.id && !!token,
    });
    // Extract unique children from contributor gifts (excluding own children)
    const contributedChildren = contributorGifts.reduce((acc, gift) => {
        if (gift.child && !acc.find((c) => c.id === gift.child.id)) {
            // Only include if this is not one of the user's own children
            const isOwnChild = userChildren.some((child) => child.id === gift.child.id);
            if (!isOwnChild) {
                acc.push({
                    ...gift.child,
                    firstName: gift.child.firstName,
                    lastName: gift.child.lastName,
                    name: gift.child.name, // Keep for backwards compatibility
                    birthdate: gift.child.birthdate,
                    age: gift.child.age, // Keep for backwards compatibility
                });
            }
        }
        return acc;
    }, []);
    // Combine all children (own + contributed)
    const allChildren = [...userChildren, ...contributedChildren];
    // Assign random journey stages to all children
    const children = allChildren.map(child => {
        // Randomly assign a journey stage
        const randomStage = journeyStages[Math.floor(Math.random() * journeyStages.length)];
        const childName = child.firstName && child.lastName
            ? `${child.firstName} ${child.lastName}`
            : child.name || 'Child';
        return {
            id: child.id,
            name: childName,
            profileImageUrl: child.profileImageUrl,
            financialJourneyStage: randomStage.id,
            progress: {
                points: Math.floor(Math.random() * 500),
                level: 1,
                gamesPlayed: Math.floor(Math.random() * 20),
                achievements: Math.floor(Math.random() * 10),
                badgesEarned: Math.floor(Math.random() * 5)
            }
        };
    });
    // Set default child if available
    useEffect(() => {
        if (children.length > 0 && !selectedChildId) {
            setSelectedChildId(children[0].id);
        }
    }, [children, selectedChildId]);
    // Calculate child positions on journey
    const getChildJourneyPositions = () => {
        // Group children by their journey stage
        const childrenByStage = children.reduce((acc, child) => {
            if (!acc[child.financialJourneyStage]) {
                acc[child.financialJourneyStage] = [];
            }
            acc[child.financialJourneyStage].push(child);
            return acc;
        }, {});
        // Calculate positions for each child, placing multiple children side-by-side
        const positions = [];
        Object.keys(childrenByStage).forEach(stageId => {
            const childrenAtStage = childrenByStage[stageId];
            const stage = journeyStages.find(s => s.id === stageId);
            const stagePosition = stage?.position || journeyStages[0].position;
            // Calculate spacing for side-by-side placement starting from upper right corner
            const childCount = childrenAtStage.length;
            const spacing = 24; // Horizontal spacing between avatars (increased for larger icons)
            // Position in upper right corner of stage icon (stage radius is 20, child radius is 16)
            // Position so edges just touch (distance between centers = 20 + 16 = 36)
            // At 45 degree angle: offset = 36 * cos(45°) = 36 * 0.707 ≈ 25.5
            const startX = stagePosition.x + 26; // Upper right corner X, edges touching
            const startY = stagePosition.y - 26; // Upper right corner Y, edges touching
            childrenAtStage.forEach((child, index) => {
                positions.push({
                    childId: child.id,
                    childName: child.name,
                    avatarUrl: child.profileImageUrl,
                    stageId: child.financialJourneyStage,
                    position: {
                        x: startX - (index * spacing), // Move left for each additional child
                        y: startY
                    }
                });
            });
        });
        return positions;
    };
    // Get current child and their progress
    const currentChild = children.find(child => child.id === selectedChildId);
    const currentChildProgress = currentChild?.progress || {
        points: 0,
        level: 1,
        gamesPlayed: 0,
        achievements: 0,
        badgesEarned: 0
    };
    const leaderboard = [
        { rank: 1, name: 'You', points: currentChildProgress.points, isCurrentUser: true },
        { rank: 2, name: 'Scottie N.', points: 100, isCurrentUser: false },
        { rank: 3, name: 'Emery N.', points: 10, isCurrentUser: false },
    ];
    const handleChildChange = (childId) => {
        setSelectedChildId(childId);
    };
    return (_jsx(MobileLayout, { currentTab: "activities", children: _jsxs("div", { className: "space-y-6 pb-16", children: [_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h1", { className: "text-[15px] font-semibold", children: "Activity Center" }), _jsx(ChildSelector, { currentChildId: selectedChildId || '', onChildChange: handleChildChange })] }), _jsx(Card, { children: _jsx(CardContent, { className: "p-4 sm:p-6", children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsxs("h3", { className: "text-xs font-semibold", children: ["Level ", currentChildProgress.level, " - Money Explorer"] }), _jsxs("span", { className: "text-xs font-normal", children: [currentChildProgress.points, "/2000 pts"] })] }), _jsx("div", { className: "mb-1", children: _jsxs("div", { className: "relative h-[8px] w-full overflow-hidden rounded-[20px]", children: [_jsx("div", { className: "h-full transition-all duration-300 ease-in-out absolute left-0 top-0", style: {
                                                                    width: `${(currentChildProgress.points / 2000) * 100}%`,
                                                                    backgroundColor: '#2563EB'
                                                                } }), _jsx("div", { className: "h-full transition-all duration-300 ease-in-out absolute left-0 top-0", style: {
                                                                    width: `${100 - (currentChildProgress.points / 2000) * 100}%`,
                                                                    backgroundColor: '#E2B25E',
                                                                    left: `${(currentChildProgress.points / 2000) * 100}%`
                                                                } })] }) })] }), _jsxs("div", { className: "grid grid-cols-3 gap-2 sm:gap-4 pt-2", children: [_jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-[40px] font-semibold", style: { color: '#265FDC' }, children: currentChildProgress.gamesPlayed }), _jsx("div", { className: "text-[10px] font-light text-muted-foreground", children: "Games Played" })] }), _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-[40px] font-semibold", style: { color: '#265FDC' }, children: currentChildProgress.achievements }), _jsx("div", { className: "text-[10px] font-light text-muted-foreground", children: "Achievements" })] }), _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-[40px] font-semibold", style: { color: '#E2B25E' }, children: currentChildProgress.badgesEarned }), _jsx("div", { className: "text-[10px] font-light text-muted-foreground", children: "Badges Earned" })] })] })] }) }) })] }), _jsxs("div", { className: "border border-gray-200 rounded-lg p-3 space-y-2", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Medal, { className: "w-5 h-5", style: { color: '#E2B25E' } }), _jsx("h2", { className: "text-xl font-bold", children: "Leaderboard" })] }), _jsx("div", { className: "space-y-1", children: leaderboard.map((entry) => (_jsxs("div", { className: `flex items-center justify-between px-2 py-1 rounded ${entry.isCurrentUser ? 'bg-blue-50 border-2 border-blue-200' : 'bg-gray-50'}`, children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "w-5 h-5 rounded-full flex items-center justify-center", style: { backgroundColor: '#E2B25E' }, children: _jsx(Medal, { className: "w-3 h-3 text-white" }) }), _jsx("span", { className: "text-sm text-gray-500", children: entry.name })] }), _jsxs("span", { className: "text-sm text-gray-500", children: [entry.points, " pts"] })] }, entry.rank))) })] }), _jsx("div", { children: _jsx(Card, { children: _jsx(CardContent, { className: "p-2 sm:p-3", children: _jsx(JourneyGraphic, { stages: journeyStages, childPositions: [], className: "mx-auto" }) }) }) })] }) }));
}
