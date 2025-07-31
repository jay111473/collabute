import { Badge } from "@/components/ui/badge";
import { Project } from "@/types/convex";
import { format } from "date-fns";
import { ArrowDownLeft, ArrowUpRight, Clock, Clock1 } from "lucide-react";

interface Transaction {
  id: string;
  transactionAmount: number | null;
  transactionType: "income" | "withdrawal" | "tip" | null;
  transactionStatus: "pending" | "completed" | "failed" | "cancelled" | null;
  transactionProject?: number | null | Project;
  transactionMethod?: string | null;
  transactionDate?: string | null;
  transactionDescription?: string;
}

interface TransactionBoxProps {
  transaction: Transaction;
}

export function TransactionBox({ transaction }: TransactionBoxProps) {
  const getStatusColor = (status: string | null) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 hover:bg-green-100";
      case "pending":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
      case "failed":
        return "bg-red-100 text-red-800 hover:bg-red-100";
      case "cancelled":
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
    }
  };

  const getTransactionTypeDisplay = (type: string | null) => {
    switch (type) {
      case "income":
        return "Payment for issue";
      case "withdrawal":
        return "Withdrawal";
      case "tip":
        return "Tip";
      default:
        return "Transaction";
    }
  };

  const isCredit =
    transaction.transactionType === "income" ||
    transaction.transactionType === "tip";

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "MMM dd, yyyy 'at' h:mm a");
  };

  return (
    <div className="w-full border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div
            className={`p-2 rounded-full ${
              isCredit ? "bg-green-100" : "bg-red-100"
            }`}
          >
            {isCredit ? (
              <ArrowDownLeft className="h-5 w-5 text-green-600" />
            ) : (
              <ArrowUpRight className="h-5 w-5 text-red-600" />
            )}
          </div>

          <div className="flex flex-col justify-start items-start space-y-2">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold">
                {getTransactionTypeDisplay(transaction.transactionType)}
                {transaction.transactionMethod &&
                  ` via ${transaction.transactionMethod}`}
              </h4>
              <Badge
                variant="outline"
                icon={<Clock1 size={14} className="text-primary" />}
                className="text-xs font-medium"
              >
                Date:{" "}
                {transaction.transactionDate &&
                  formatDate(transaction.transactionDate)}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant="secondary"
                className={`${getStatusColor(transaction.transactionStatus)}`}
              >
                {transaction.transactionStatus || "unknown"}
              </Badge>
              {transaction.transactionDate && (
                <div className="flex items-center gap-1 text-gray-500">
                  <Clock className="h-3 w-3" />
                  <span className="text-xs">
                    {formatDate(transaction.transactionDate)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1">
          <span
            className={`text-base font-semibold ${
              isCredit ? "text-green-600" : "text-red-600"
            }`}
          >
            {isCredit ? "+" : "-"}$
            {Math.abs(transaction.transactionAmount || 0).toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}
