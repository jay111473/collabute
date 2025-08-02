"use client";

import { TransactionsTable } from "@/components/admin/transactions/transactions-table";

export default function TransactionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Transactions Management</h1>
        <p className="text-gray-600 mt-1">Monitor and manage financial transactions</p>
      </div>
      
      <TransactionsTable />
    </div>
  );
}