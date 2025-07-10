"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Toaster } from "sonner";
import DashboardLayout from "@/components/dashboard/dashboard-layout";
import useKycForm from "@/components/dashboard/kyc/use-kyc-form";
import PersonalInfoForm from "@/components/dashboard/kyc/personal-info-form";
import BusinessInfoForm from "@/components/dashboard/kyc/business-info-form";
import BankingInfoForm from "@/components/dashboard/kyc/banking-info-form";
import KycStatusAlert from "@/components/dashboard/kyc/kyc-status-alert";

const KYCPage = () => {
  const {
    user,
    loading,
    activeTab,
    setActiveTab,
    bankFormat,
    handlePersonalSubmit,
    handleBusinessSubmit,
    handleBankingSubmit,
  } = useKycForm();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Loading...
      </div>
    );
  }

  if (!user) {
    return <div>User not found</div>;
  }

  return (
    <div className="p-6">
      <Toaster />
      <h1 className="text-2xl font-bold mb-6">KYC Verification</h1>

      <KycStatusAlert status={user.kycStatus} />

      {(user.kycStatus === "pending" ||
        user.kycStatus === "rejected" ||
        !user.kycStatus) && (
        <div className="rounded-[8px] border border-white/10 bg-darkGray">
          <div className="flex flex-col space-y-1.5 p-6">
            <h3 className="text-2xl font-semibold leading-none tracking-tight">
              Complete Your Verification
            </h3>
          </div>

          <div className="p-6 pt-0">
            <Tabs
              defaultValue={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="mb-4">
                <TabsTrigger value="personal">
                  Personal Verification
                </TabsTrigger>
                {user.type === "startup" && (
                  <TabsTrigger value="business">
                    Business Verification
                  </TabsTrigger>
                )}
                {user.type === "developer" && (
                  <TabsTrigger value="banking">Banking Information</TabsTrigger>
                )}
              </TabsList>

              <TabsContent value="personal">
                <PersonalInfoForm
                  defaultValues={{ fullName: user.name }}
                  onSubmit={handlePersonalSubmit}
                  isStartup={user.type === "startup"}
                />
              </TabsContent>

              {user.type === "startup" && (
                <TabsContent value="business">
                  <BusinessInfoForm
                    defaultValues={{
                      companyName: user.startupFields?.companyName || "",
                      registrationNumber: "",
                      taxId: "",
                    }}
                    onSubmit={handleBusinessSubmit}
                  />
                </TabsContent>
              )}

              {user.type === "developer" && (
                <TabsContent value="banking">
                  <BankingInfoForm
                    bankFormat={bankFormat}
                    onSubmit={handleBankingSubmit}
                  />
                </TabsContent>
              )}
            </Tabs>
          </div>

          <div className="flex items-center p-6 pt-0">
            <p className="text-sm text-gray-400">
              All your information is securely stored and handled according to
              our privacy policy.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default KYCPage;
