import DashboardCard from "@/components/uikit/dashboard-card";
import { getUser } from "@/lib/get-user";
import { cookies } from "next/headers";
import { DollarSign } from "lucide-react";
import React from "react";
import { TransactionBox } from "@/components/dashboard/payments/transaction-box";
import Sidebar from "@/components/dashboard/Sidebar";
import { redirect } from "next/navigation";

const Payments = async () => {
  const token = (await cookies()).get("token")?.value;
  const data = await getUser(token || "");
  const user = data?.user;
  if (!token) {
    redirect("/auth");
  }
  return (
    <div className="flex bg-black ">
      <Sidebar user={user} />
      <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
        <div className="grid gap-4 md:grid-cols-2 md:gap-4 lg:grid-cols-2">
          <DashboardCard
            title="Current Balance"
            value={`$${user.wallet}`}
            icon={DollarSign}
          />
          <DashboardCard
            title="To Withdraw"
            value={`$${user?.developerFields?.withdrawableAmount}`}
            icon={DollarSign}
          />
        </div>
        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-medium">Transactions</h2>
          <div className="flex flex-col gap-4">
            {user?.transactions?.map((transaction: any) => (
              <TransactionBox
                key={transaction?.id || ""}
                transaction={{
                  id: transaction?.id || "",
                  transactionDate: transaction?.transactionDate || "",
                  transactionAmount: transaction?.transactionAmount || 0,
                  transactionType: transaction?.transactionType || "income",
                  transactionMethod: transaction?.transactionMethods || "",
                  transactionStatus:
                    transaction?.transactionStatus || "pending",
                  transactionProject: transaction?.transactionProject,
                  transactionDescription:
                    transaction?.transactionDescription || "",
                }}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Payments;
