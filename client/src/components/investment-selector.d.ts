import type { Investment } from "@shared/schema";
interface InvestmentSelectorProps {
    selectedInvestment: Investment | null;
    onSelectInvestment: (investment: Investment) => void;
}
export default function InvestmentSelector({ selectedInvestment, onSelectInvestment }: InvestmentSelectorProps): import("react/jsx-runtime").JSX.Element;
export {};
