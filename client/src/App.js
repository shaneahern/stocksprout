import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Home from "@/pages/home";
import Portfolio from "@/pages/portfolio";
import Timeline from "@/pages/timeline";
import Profile from "@/pages/profile";
import Activities from "@/pages/activities";
import GiftGiver from "@/pages/gift-giver";
import AddChild from "@/pages/add-child";
import AuthPage from "@/pages/auth";
import SproutRequestPage from "@/pages/sprout-request";
import PrivacyPolicy from "@/pages/privacy-policy";
import ForgotPassword from "@/pages/forgot-password";
import EarlyAccess from "@/pages/early-access";
// Contributor dashboard now uses standard home page
import NotFound from "@/pages/not-found";
function ProtectedRoute({ children }) {
    const { user, isLoading } = useAuth();
    if (isLoading) {
        return (_jsx("div", { className: "min-h-screen flex items-center justify-center", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" }), _jsx("p", { className: "mt-2 text-muted-foreground", children: "Loading..." })] }) }));
    }
    // Allow access if user is logged in
    if (!user) {
        return _jsx(AuthPage, {});
    }
    return _jsx(_Fragment, { children: children });
}
function Router() {
    return (_jsxs(Switch, { children: [_jsx(Route, { path: "/auth", component: AuthPage }), _jsx(Route, { path: "/forgot-password", component: ForgotPassword }), _jsx(Route, { path: "/privacy-policy", component: PrivacyPolicy }), _jsx(Route, { path: "/early-access", component: EarlyAccess }), _jsx(Route, { path: "/gift/:giftCode", component: GiftGiver }), _jsx(Route, { path: "/sprout/:requestCode", component: SproutRequestPage }), _jsx(Route, { path: "/contributor-dashboard", children: () => {
                    window.location.href = '/';
                    return null;
                } }), _jsx(Route, { path: "/", children: _jsx(ProtectedRoute, { children: _jsx(Home, {}) }) }), _jsx(Route, { path: "/portfolio", children: _jsx(ProtectedRoute, { children: _jsx(Portfolio, {}) }) }), _jsx(Route, { path: "/portfolio/:childId", children: _jsx(ProtectedRoute, { children: _jsx(Portfolio, {}) }) }), _jsx(Route, { path: "/timeline", children: _jsx(ProtectedRoute, { children: _jsx(Timeline, {}) }) }), _jsx(Route, { path: "/timeline/:childId", children: _jsx(ProtectedRoute, { children: _jsx(Timeline, {}) }) }), _jsx(Route, { path: "/activities", children: _jsx(ProtectedRoute, { children: _jsx(Activities, {}) }) }), _jsx(Route, { path: "/profile", children: _jsx(ProtectedRoute, { children: _jsx(Profile, {}) }) }), _jsx(Route, { path: "/add-child", children: _jsx(ProtectedRoute, { children: _jsx(AddChild, {}) }) }), _jsx(Route, { component: NotFound })] }));
}
function App() {
    return (_jsx(QueryClientProvider, { client: queryClient, children: _jsx(AuthProvider, { children: _jsxs(TooltipProvider, { children: [_jsx(Toaster, {}), _jsx(Router, {})] }) }) }));
}
export default App;
