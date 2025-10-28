import { ReactNode } from 'react';
export interface User {
    id: string;
    username?: string | null;
    email: string;
    name: string;
    phone?: string | null;
    profileImageUrl?: string | null;
    bankAccountNumber?: string | null;
    createdAt: string;
}
interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (email: string, password: string) => Promise<void>;
    signup: (data: SignupData) => Promise<void>;
    logout: () => void;
    updateProfile: (data: UpdateProfileData) => Promise<void>;
    isLoading: boolean;
}
interface SignupData {
    username?: string;
    email: string;
    password: string;
    name: string;
    phone?: string;
    bankAccountNumber?: string;
    profileImageUrl?: string;
}
interface UpdateProfileData {
    name?: string;
    profileImageUrl?: string;
    bankAccountNumber?: string;
}
export declare function AuthProvider({ children }: {
    children: ReactNode;
}): import("react/jsx-runtime").JSX.Element;
export declare function useAuth(): AuthContextType;
export type { SignupData as ContributorSignupData };
