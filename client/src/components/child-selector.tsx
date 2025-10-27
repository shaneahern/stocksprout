import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User } from 'lucide-react';
import { calculateAge } from '@/lib/utils';

interface ChildSelectorProps {
  currentChildId: string;
  onChildChange?: (childId: string) => void;
  redirectPath?: 'portfolio' | 'timeline'; // Which page to redirect to when changing child
}

export function ChildSelector({ currentChildId, onChildChange, redirectPath }: ChildSelectorProps) {
  const { user, token } = useAuth();
  const [, setLocation] = useLocation();

  // Fetch custodian's children (children where user is parent)
  const { data: userChildren = [] } = useQuery<any[]>({
    queryKey: ['/api/children', user?.id],
    enabled: !!user?.id,
  });

  // Fetch children that user has contributed to (gifts they've given)
  const { data: contributorGifts = [] } = useQuery<any[]>({
    queryKey: ['/api/contributors/gifts-for-selector', user?.id],
    queryFn: async () => {
      if (!user?.id || !token) return [];
      
      const response = await fetch(`/api/contributors/${user.id}/gifts`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) return [];
      return response.json();
    },
    enabled: !!user?.id && !!token,
  });

  // Extract unique children from contributor gifts (excluding own children)
  const contributedChildren = contributorGifts.reduce((acc: any[], gift: any) => {
    if (gift.child && !acc.find((c: any) => c.id === gift.child.id)) {
      // Only include if this is not one of the user's own children
      const isOwnChild = userChildren.some((child: any) => child.id === gift.child.id);
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

  const handleValueChange = (childId: string) => {
    if (onChildChange) {
      onChildChange(childId);
    }
    
    if (redirectPath) {
      setLocation(`/${redirectPath}/${childId}`);
    }
  };

  const currentChild = allChildren.find((child: any) => child.id === currentChildId);

  // Helper function to get child's full name
  const getChildName = (child: any) => {
    if (child?.firstName && child?.lastName) {
      return `${child.firstName} ${child.lastName}`;
    }
    return child?.name || 'Child';
  };

  // Helper function to get child's age
  const getChildAge = (child: any) => {
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
    return (
      <div className="flex items-center gap-3 px-3 py-2 bg-muted rounded-lg">
        <Avatar className="w-8 h-8">
          {currentChild?.profileImageUrl && (
            <AvatarImage src={currentChild.profileImageUrl} alt={childName} />
          )}
          <AvatarFallback className="text-sm">
            {currentChild?.firstName?.charAt(0)?.toUpperCase() || currentChild?.name?.charAt(0)?.toUpperCase() || 'C'}
          </AvatarFallback>
        </Avatar>
        <span className="font-semibold text-base">{childName}</span>
      </div>
    );
  }

  const currentChildName = getChildName(currentChild);

  return (
    <Select value={currentChildId} onValueChange={handleValueChange}>
      <SelectTrigger className="w-full max-w-[200px]">
        <SelectValue>
          <div className="flex items-center gap-3">
            <Avatar className="w-8 h-8">
              {currentChild?.profileImageUrl && (
                <AvatarImage src={currentChild.profileImageUrl} alt={currentChildName} />
              )}
              <AvatarFallback className="text-sm">
                {currentChild?.firstName?.charAt(0)?.toUpperCase() || currentChild?.name?.charAt(0)?.toUpperCase() || 'C'}
              </AvatarFallback>
            </Avatar>
            <span className="font-semibold text-base truncate">
              {currentChildName || 'Select Child'}
            </span>
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {allChildren.map((child: any) => {
          const childName = getChildName(child);
          const childAge = getChildAge(child);
          return (
            <SelectItem key={child.id} value={child.id}>
              <div className="flex items-center gap-3">
                <Avatar className="w-8 h-8">
                  {child.profileImageUrl && (
                    <AvatarImage src={child.profileImageUrl} alt={childName} />
                  )}
                  <AvatarFallback className="text-sm">
                    {child.firstName?.charAt(0)?.toUpperCase() || child.name?.charAt(0)?.toUpperCase() || 'C'}
                  </AvatarFallback>
                </Avatar>
                <span className="text-base font-medium">{childName}</span>
                <span className="text-sm text-muted-foreground">
                  (Age {childAge})
                </span>
              </div>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
