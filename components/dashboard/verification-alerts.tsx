"use client";

import { AlertCircle, Calendar, UserPen } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useEffect } from "react";
import { getCalApi } from "@calcom/embed-react";
import { useUserConvex } from "@/hooks/use-user-convex";

export const VerificationAlerts = () => {
  const router = useRouter();
  const { user } = useUserConvex();

  const showVerificationCalendar = () => {
    toast.success("Opening verification calendar...", {
      description: "Our team will contact you soon for verification.",
      icon: <Calendar className="h-4 w-4" />,
    });
  };

  useEffect(() => {
    (async function () {
      const cal = await getCalApi({
        namespace: "interview-with-behrooz-evans",
      });
      cal("ui", {
        theme: "dark",
        cssVarsPerTheme: {
          dark: { "cal-brand": "#000000" },
          light: { "cal-brand": "#000000" },
        },
        hideEventTypeDetails: false,
        layout: "month_view",
      });
    })();
  }, []);

  return (
    <div className="space-y-2">
      {/* Account Verification Alert */}
      {user?.isVerified === false && (
        <Alert className="bg-white/50 border-none flex flex-col md:flex-row md:items-center md:justify-between py-2 gap-2">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 text-white/80" />
            <p className="text-sm text-white/80 font-medium">
              Book an appointment to verify your account.
            </p>
          </div>
          <Button
            size="sm"
            className="ml-0 md:ml-2 h-8 text-black bg-white hover:bg-white/70 w-full md:w-auto text-xs"
            onClick={showVerificationCalendar}
            data-cal-namespace="interview-with-behrooz-evans"
            data-cal-link="behevans/interview-with-behrooz-evans"
            data-cal-config='{"layout":"month_view","theme":"dark"}'
          >
            <Calendar className="mr-2 h-3 w-3" />
            Book Appointment
          </Button>
        </Alert>
      )}

      {/* KYC Verification Alert */}
      {user?.kycStatus !== "PENDING" && (
        <Alert className="bg-darkGray flex flex-col md:flex-row md:items-center md:justify-between py-2 border-none gap-2">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 text-darkPrimary" />
            <p className="text-sm text-white font-medium">
              Complete KYC verification to unlock all payment capabilities.
            </p>
          </div>
          <Button
            variant="outline"
            className="ml-0 md:ml-2 h-8 bg-darkPrimary text-white hover:bg-darkPrimary/80 w-full md:w-auto text-xs"
            onClick={() => router.push("/dashboard/kyc")}
          >
            <UserPen className="mr-2 h-3 w-3" />
            Complete KYC
          </Button>
        </Alert>
      )}
    </div>
  );
};
