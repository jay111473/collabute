"use client";
import { TransactionBox } from "@/components/dashboard/payments/transaction-box";
import { ProjectsPaymentOverview } from "@/components/dashboard/payments/projects-payment-overview";
import { api } from "@/convex/_generated/api";
import { useUserConvex } from "@/hooks/use-user-convex";
import { useQuery } from "convex/react";
import React from "react";
import { Id } from "@/convex/_generated/dataModel";
import { DashboardPaymentCard } from "@/components/dashboard/payments/dashboard-payment-card";

const Payments = () => {
  const { user } = useUserConvex();

  const getUserTransactions = useQuery(
    api.transactions.getByUser,
    user?._id ? { userId: user._id } : "skip"
  );

  const getUserProjects = useQuery(
    api.projects.getAllProjects,
    user?._id ? { ownerId: user._id } : "skip"
  );

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
      <div className="grid gap-4 md:grid-cols-2 md:gap-4 lg:grid-cols-2">
        <DashboardPaymentCard
          title="Current Balance"
          value={`${user?.wallet || 0}`}
          buttonText="Deposit"
          buttonVariant="filled"
        />
        <DashboardPaymentCard
          title="Total Paid"
          value={`${user?.wallet || 0}`}
          buttonText="All transactions"
          buttonVariant="outlined"
        />
      </div>

      <ProjectsPaymentOverview projects={getUserProjects} />

      <div className="space-y-4">
        <h1 className="text-[17px] font-semibold text-white mb-3">
          Recent Transactions
        </h1>
        {getUserTransactions?.map((transaction) => (
          <TransactionBox
            key={transaction._id}
            transaction={{
              id: transaction._id,
              amount: Number(transaction.amount),
              type: transaction.type as "income" | "withdrawal" | "tip",
              status: transaction.status as
                | "pending"
                | "completed"
                | "failed"
                | "cancelled",
              transactionDate: new Date(
                transaction._creationTime
              ).toISOString(),
              description: transaction.description,
              projectId: transaction.projectId as Id<"projects">,
              method: transaction.method,
              userId: transaction.userId as Id<"users">,
            }}
          />
        ))}
      </div>
    </main>
  );
};

export default Payments;
