"use client";

import React from "react";

interface PaymentDashboardCardProps {
  title: string;
  value: string;
  subtext?: string;
  buttonText: string;
  buttonVariant?: "filled" | "outlined";
}

export const PaymentDashboardCard = ({
  title,
  value,
  subtext,
  buttonText,
  buttonVariant = "filled",
}: PaymentDashboardCardProps) => {
  const isFilled = buttonVariant === "filled";

  return (
    <div className="flex justify-center flex-col items-start w-full bg-[#18181B] rounded-xl px-6 py-5">
      <div className="flex w-full justify-between items-center">
        <p
          className={`text-[14px] font-medium ${
            isFilled ? "text-[#34D399]" : "text-[#C084FC]"
          }`}
        >
          {title}
        </p>

        {isFilled ? (
          <button className="bg-[#34D399] hover:bg-[#2BB68D] text-[13px] font-medium text-black rounded-md px-4 py-[6px] transition">
            {buttonText}
          </button>
        ) : (
          <button
            className="bg-transparent text-[13px] font-medium text-white px-4 py-[6px] border rounded-md border-transparent hover:border-[#C084FC] transition"
            style={{
              borderImage: "linear-gradient(to right, #7C3AED, #3B82F6) 1",
              borderRadius: "10px",
            }}
          >
            {buttonText}
          </button>
        )}
      </div>
      <p className="text-[26px] font-bold text-white mt-1">
        {new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
          minimumFractionDigits: 0,
        }).format(Number(value))}
      </p>
      {subtext && (
        <p className="text-[13px] text-[#9CA3AF] mt-[2px]">{subtext}</p>
      )}
    </div>
  );
};