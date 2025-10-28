import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { calculateAge } from '@/lib/utils';
export function ChildSelector({ currentChildId, onChildChange, redirectPath }) {
    const { user, token } = useAuth();
    const [, setLocation] = useLocation();
    // Fetch custodian's children (children where user is parent)
    const { data: userChildren = [] } = useQuery({
        queryKey: ['/api/children', user?.id],
        enabled: !!user?.id,
    });
    // Fetch children that user has contributed to (gifts they've given)
    const { data: contributorGifts = [] } = useQuery({
        queryKey: ['/api/contributors/gifts-for-selector', user?.id],
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
                    id: gift.child.id,
                    firstName: gift.child.firstName,
                    lastName: gift.child.lastName,
                    name: gift.child.name, // Keep for backwards compatibility
                    giftLinkCode: gift.child.giftCode,
                    profileImageUrl: gift.child.profileImageUrl,
                    birthdate: gift.child.birthdate,
                    age: gift.child.age || 0, // Keep for backwards compatibility
                    isContributed: true
                });
            }
        }
        return acc;
    }, []);
    // Combine both lists - user's own children and children they've contributed to
    const allChildren = [...userChildren, ...contributedChildren];
    const handleValueChange = (childId) => {
        if (onChildChange) {
            onChildChange(childId);
        }
        if (redirectPath) {
            setLocation(`/${redirectPath}/${childId}`);
        }
    };
    const currentChild = allChildren.find((child) => child.id === currentChildId);
    // Helper function to get child's full name
    const getChildName = (child) => {
        if (child?.firstName && child?.lastName) {
            return `${child.firstName} ${child.lastName}`;
        }
        return child?.name || 'Child';
    };
    // Helper function to get child's age
    const getChildAge = (child) => {
        if (child?.birthdate) {
            return calculateAge(child.birthdate);
        }
        return child?.age || 0;
    };
    if (allChildren.length === 0) {
        return null;
    }
    if (allChildren.length === 1) {
        // If only one child, just show their name (no selector needed)
        const childName = getChildName(currentChild);
        return (_jsxs("div", { className: "flex items-center gap-3 px-3 py-2 bg-muted rounded-lg", children: [_jsxs(Avatar, { className: "w-8 h-8", children: [currentChild?.profileImageUrl && (_jsx(AvatarImage, { src: currentChild.profileImageUrl, alt: childName })), _jsx(AvatarFallback, { className: "text-sm", children: currentChild?.firstName?.charAt(0)?.toUpperCase() || currentChild?.name?.charAt(0)?.toUpperCase() || 'C' })] }), _jsx("span", { className: "font-semibold text-base", children: childName })] }));
    }
    const currentChildName = getChildName(currentChild);
    return (_jsxs(Select, { value: currentChildId, onValueChange: handleValueChange, children: [_jsx(SelectTrigger, { className: "w-full max-w-[200px]", children: _jsx(SelectValue, { children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsxs(Avatar, { className: "w-8 h-8", children: [currentChild?.profileImageUrl && (_jsx(AvatarImage, { src: currentChild.profileImageUrl, alt: currentChildName })), _jsx(AvatarFallback, { className: "text-sm", children: currentChild?.firstName?.charAt(0)?.toUpperCase() || currentChild?.name?.charAt(0)?.toUpperCase() || 'C' })] }), _jsx("span", { className: "font-semibold text-base truncate", children: currentChildName || 'Select Child' })] }) }) }), _jsx(SelectContent, { children: allChildren.map((child) => {
                    const childName = getChildName(child);
                    const childAge = getChildAge(child);
                    return (_jsx(SelectItem, { value: child.id, children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsxs(Avatar, { className: "w-8 h-8", children: [child.profileImageUrl && (_jsx(AvatarImage, { src: child.profileImageUrl, alt: childName })), _jsx(AvatarFallback, { className: "text-sm", children: child.firstName?.charAt(0)?.toUpperCase() || child.name?.charAt(0)?.toUpperCase() || 'C' })] }), _jsx("span", { className: "text-base font-medium", children: childName }), _jsxs("span", { className: "text-sm text-muted-foreground", children: ["(Age ", childAge, ")"] })] }) }, child.id));
                }) })] }));
}
