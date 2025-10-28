import type { Investment } from "@shared/schema";
interface BrokerageTransferSelectorProps {
    selectedInvestment: Investment | null;
    selectedShares: string;
    onSelectInvestment: (investment: Investment) => void;
    onSharesChange: (shares: string) => void;
}
export default function BrokerageTransferSelector({ selectedInvestment, selectedShares, onSelectInvestment, onSharesChange }: BrokerageTransferSelectorProps): import("react/jsx-runtime").JSX.Element;
export {};
