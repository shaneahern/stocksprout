import { ReactNode } from "react";
interface MobileLayoutProps {
    children: ReactNode;
    currentTab: "home" | "portfolio" | "timeline" | "profile" | "activities";
}
export default function MobileLayout({ children, currentTab }: MobileLayoutProps): import("react/jsx-runtime").JSX.Element;
export {};
