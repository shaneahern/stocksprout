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
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User } from 'lucide-react';

interface ChildSelectorProps {
  currentChildId: string;
  onChildChange?: (childId: string) => void;
  redirectPath?: 'portfolio' | 'timeline'; // Which page to redirect to when changing child
}

export function ChildSelector({ currentChildId, onChildChange, redirectPath }: ChildSelectorProps) {
  const { user, contributor, contributorToken } = useAuth();
  const [, setLocation] = useLocation();

  // Fetch custodian's children
  const { data: userChildren = [] } = useQuery<any[]>({
    queryKey: ['/api/children', user?.id],
    enabled: !!user?.id,
  });

  // Fetch children that contributor has contributed to
  const { data: contributorGifts = [] } = useQuery<any[]>({
    queryKey: ['/api/contributors/gifts-for-selector', contributor?.id],
    queryFn: async () => {
      if (!contributor?.id || !contributorToken) return [];
      
      const response = await fetch(`/api/contributors/${contributor.id}/gifts`, {
        headers: {
          'Authorization': `Bearer ${contributorToken}`,
        },
      });
      
      if (!response.ok) return [];
      return response.json();
    },
    enabled: !!contributor?.id && !!contributorToken,
  });

  // Extract unique children from contributor gifts
  const contributedChildren = contributorGifts.reduce((acc: any[], gift: any) => {
    if (gift.child && !acc.find((c: any) => c.id === gift.child.id)) {
      acc.push({
        id: gift.child.id,
        name: gift.child.name,
        giftLinkCode: gift.child.giftCode,
        age: 0, // Don't have age for contributed children
        isContributed: true
      });
    }
    return acc;
  }, []);

  // Combine children lists
  const allChildren = user ? userChildren : contributedChildren;

  const handleValueChange = (childId: string) => {
    if (onChildChange) {
      onChildChange(childId);
    }
    
    if (redirectPath) {
      setLocation(`/${redirectPath}/${childId}`);
    }
  };

  const currentChild = allChildren.find((child: any) => child.id === currentChildId);

  if (allChildren.length === 0) {
    return null;
  }

  if (allChildren.length === 1) {
    // If only one child, just show their name (no selector needed)
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-lg">
        <Avatar className="w-6 h-6">
          {currentChild?.profileImageUrl ? (
            <img src={currentChild.profileImageUrl} alt={currentChild.name} />
          ) : (
            <AvatarFallback className="text-xs">
              {currentChild?.name?.charAt(0)?.toUpperCase() || 'C'}
            </AvatarFallback>
          )}
        </Avatar>
        <span className="font-semibold text-sm">{currentChild?.name || 'Child'}</span>
      </div>
    );
  }

  return (
    <Select value={currentChildId} onValueChange={handleValueChange}>
      <SelectTrigger className="w-full max-w-[200px]">
        <SelectValue>
          <div className="flex items-center gap-2">
            <Avatar className="w-5 h-5">
              {currentChild?.profileImageUrl ? (
                <img src={currentChild.profileImageUrl} alt={currentChild.name} />
              ) : (
                <AvatarFallback className="text-xs">
                  {currentChild?.name?.charAt(0)?.toUpperCase() || 'C'}
                </AvatarFallback>
              )}
            </Avatar>
            <span className="font-semibold text-sm truncate">
              {currentChild?.name || 'Select Child'}
            </span>
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {allChildren.map((child: any) => (
          <SelectItem key={child.id} value={child.id}>
            <div className="flex items-center gap-2">
              <Avatar className="w-5 h-5">
                {child.profileImageUrl ? (
                  <img src={child.profileImageUrl} alt={child.name} />
                ) : (
                  <AvatarFallback className="text-xs">
                    {child.name?.charAt(0)?.toUpperCase()}
                  </AvatarFallback>
                )}
              </Avatar>
              <span>{child.name}</span>
              {!child.isContributed && child.age !== undefined && (
                <span className="text-xs text-muted-foreground">
                  (Age {child.age})
                </span>
              )}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
