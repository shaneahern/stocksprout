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
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const { data: children = [] } = useQuery<any[]>({
    queryKey: ['/api/children', user?.id],
    enabled: !!user?.id,
  });

  const handleValueChange = (childId: string) => {
    if (onChildChange) {
      onChildChange(childId);
    }
    
    if (redirectPath) {
      setLocation(`/${redirectPath}/${childId}`);
    }
  };

  const currentChild = children.find((child: any) => child.id === currentChildId);

  if (children.length === 0) {
    return null;
  }

  if (children.length === 1) {
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
        {children.map((child: any) => (
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
              <span className="text-xs text-muted-foreground">
                (Age {child.age})
              </span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
