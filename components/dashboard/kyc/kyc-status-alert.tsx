"use client";

type KycStatus = "pending" | "verified" | "rejected" | null | undefined;

interface KycStatusAlertProps {
  status: KycStatus;
}

export const KycStatusAlert = ({ status }: KycStatusAlertProps) => {
  if (!status) return null;

  const alertClasses = "mb-6 p-4 rounded-[8px] border border-white/10 bg-darkGray";
  
  switch (status) {
    case "pending":
      return (
        <div className={`${alertClasses} text-yellow-500`}>
          Your KYC verification is pending. Please complete all required
          information.
        </div>
      );
    case "rejected":
      return (
        <div className={`${alertClasses} text-red-500`}>
          Your KYC verification was rejected. Please update your information
          and try again.
        </div>
      );
    case "verified":
      return (
        <div className={`${alertClasses} text-green-500`}>
          Your identity has been verified successfully.
        </div>
      );
    default:
      return null;
  }
};

export default KycStatusAlert; 