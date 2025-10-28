interface ChildSelectorProps {
    currentChildId: string;
    onChildChange?: (childId: string) => void;
    redirectPath?: 'portfolio' | 'timeline';
}
export declare function ChildSelector({ currentChildId, onChildChange, redirectPath }: ChildSelectorProps): import("react/jsx-runtime").JSX.Element | null;
export {};
