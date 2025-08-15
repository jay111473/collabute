import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { format } from "date-fns";
import {
  Banknote,
  Hand,
  Coins,
  User,
  Clock,
  DollarSign,
  Layers3,
  GitFork,
} from "lucide-react";

interface Transaction {
  id: string;
  amount: number;
  type: string;
  status: string;
  method: string;
  userId: Id<"users">;
  description?: string;
  projectId?: Id<"projects">;
  reference?: string;
  transactionDate?: string;
}

interface TransactionBoxProps {
  transaction: Transaction;
}

export function TransactionBox({ transaction }: TransactionBoxProps) {
  const getTransactionTitle = () => {
    switch (transaction.type) {
      case "income":
        return "Payment for Issue";
      case "withdrawal":
        return "Withdrawal";
      case "tip":
        return "Tip from CTO";
      default:
        return "Transaction";
    }
  };

  const getIcon = () => {
    switch (transaction.type) {
      case "income":
        return <DollarSign className="h-4 w-4 text-white" />;
      case "withdrawal":
        return <Banknote className="h-4 w-4 text-white" />;
      case "tip":
        return <Hand className="h-4 w-4 text-white" />;
      default:
        return <Coins className="h-4 w-4 text-white" />;
    }
  };

  const getIconBgColor = () => {
    switch (transaction.type) {
      case "income":
        return "bg-purple-500";
      case "withdrawal":
        return "bg-red-500";
      case "tip":
        return "bg-orange-500";
      default:
        return "bg-gray-500";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "MMM dd, yyyy");
  };

  const isNegative =
    transaction.type === "withdrawal" || transaction.type === "tip";

  const project = useQuery(
    api.projects.getProjectDetailsById,
    transaction.projectId ? { projectId: transaction.projectId } : "skip"
  );

  return (
    <div className="flex items-center justify-between w-full bg-[#111111] rounded-xl px-5 py-4">
      <div className="flex items-start gap-x-3">
        <div
          className={`w-8 h-8 rounded-full ${getIconBgColor()} flex items-center justify-center`}
        >
          {getIcon()}
        </div>
        <div className="flex flex-col gap-y-2">
          <div className="flex items-center gap-x-2">
            <span className="text-white text-[15px] font-medium">
              {getTransactionTitle()}
            </span>
            <div className="flex items-center gap-x-2 justify-center">
              <div className="flex items-center justify-end gap-1 text-[12px] text-[#9CA3AF] border rounded-full border-gray-700 px-2 py-1">
                <Clock className="h-3 w-3 text-darkPrimary" />
                <span>Date</span>
                <span className="text-white font-bold">
                  {transaction.transactionDate &&
                    formatDate(transaction.transactionDate)}
                </span>
              </div>

              <div className="flex items-center border rounded-full border-gray-700 px-2 py-1 justify-end gap-1 text-[12px] text-[#9CA3AF]">
                <DollarSign className="h-3 w-3 text-darkPrimary" />
                <span>Type</span>
                <span className="text-white font-bold">
                  {transaction.method}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-x-4 text-[12px] text-[#9CA3AF] mt-1 divide-x divide-gray-700">
            {project && (
              <div className="flex items-center gap-1">
                <Layers3 className="h-3 w-3" />
                <span>Project</span>
                <span className="text-white font-bold text-xs ml-0.5">
                  {project?.title || "Unknown"}
                </span>
              </div>
            )}

            {transaction.description && (
              <div className="flex items-center gap-1 pl-4">
                <GitFork className="h-3 w-3" />
                <span>Issue</span>
                <span className="text-white font-bold">
                  {transaction.description}
                </span>
              </div>
            )}

            {transaction.type === "tip" && transaction.reference && (
              <div className="flex items-center gap-1 pl-4">
                <User className="h-3 w-3" />
                <span>CTO</span>
                <span className="text-white font-bold">
                  {transaction.reference}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center flex-col gap-2">
        <div className="text-right">
          <span
            className={`text-[15px] font-medium ${isNegative ? "text-orange-400" : "text-white"}`}
          >
            {isNegative ? "- $" : "$"} {Math.abs(transaction.amount || 0)}
          </span>
        </div>
        <button className="px-3 py-1 bg-[#2C2C2C] hover:bg-[#3A3A3A] text-white text-[13px] rounded-lg border border-[#3A3A3A] transition">
          Details
        </button>
      </div>
    </div>
  );
}
