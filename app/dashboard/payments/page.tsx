import DashboardCard from "@/components/uikit/dashboard-card";
import { getUser } from "@/lib/get-user";
import { DollarSign } from "lucide-react";
import React from "react";
import DashboardLayout from "@/components/dashboard/dashboard-layout";
import { redirect } from "next/navigation";

const Payments = async () => {
  const user = await getUser(2);
  if (!user) {
    redirect("/auth");
  }
  return (
    <DashboardLayout user={user} title="Payments">
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
        <div className="border mt-3 rounded-xl p-4 w-full border-white/10 bg-darkGray">
          <h3 className="text-xl font-semibold text-white mb-4">
            Transaction History
          </h3>
          <div className="space-y-4">
            {/* <TransactionBox
              type="withdrawal"
              date="2023-09-12"
              amount={150}
              status="completed"
            />
            <TransactionBox
              type="payment"
              date="2023-09-10"
              amount={300}
              status="completed"
            />
            <TransactionBox
              type="withdrawal"
              date="2023-09-05"
              amount={500}
              status="pending"
            /> */}
          </div>
        </div>
      </main>
    </DashboardLayout>
  );
};

export default Payments;
