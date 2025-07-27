"use client";

type KycStatus = "PENDING" | "VERIFIED" | "REJECTED";

interface KycStatusAlertProps {
  status: KycStatus;
}

export const KycStatusAlert = ({ status }: KycStatusAlertProps) => {
  if (!status) return null;

  const alertClasses =
    "mb-6 p-4 rounded-[8px] border border-white/10 bg-darkGray";

  switch (status) {
    case "PENDING":
      return (
        <div className={`${alertClasses} text-yellow-500`}>
          Your KYC verification is pending. Please complete all required
          information.
        </div>
      );
    case "REJECTED":
      return (
        <div className={`${alertClasses} text-red-500`}>
          Your KYC verification was rejected. Please update your information and
          try again.
        </div>
      );
    case "VERIFIED":
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
