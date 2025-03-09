import { cookies } from "next/headers";
import { getUser } from "@/lib/get-user";
import Sidebar from "@/components/dashboard/Sidebar";
import AccountSettings from "./components/AccountSettings";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function SettingsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const userId = cookieStore.get("userid")?.value;
  const user = await getUser(userId || "", token || "");

  return (
    <div className="flex min-h-screen w-full">
      <Sidebar user={user} />
      <div className="flex flex-col bg-black text-white flex-1">
        <div className="flex items-center justify-between p-6">
          <h1 className="text-2xl font-semibold">Settings</h1>
        </div>
        <div className="px-6">
          <div className="bg-darkGray rounded-lg p-4">
            <Tabs defaultValue="account" className="w-full">
              <TabsList className="bg-transparent p-0 w-full justify-start ">
                <TabsTrigger
                  value="account"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary2 data-[state=active]:bg-transparent px-6 py-4 !text-sm"
                >
                  Account
                </TabsTrigger>
                <TabsTrigger
                  value="security"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary2 data-[state=active]:bg-transparent px-6 py-4 !text-sm"
                >
                  Security
                </TabsTrigger>
                <TabsTrigger
                  value="withdraw"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary2 data-[state=active]:bg-transparent px-6 py-4 !text-sm"
                >
                  Withdraw method
                </TabsTrigger>
              </TabsList>
              <TabsContent value="account" className="p-6">
                <AccountSettings user={user} />
              </TabsContent>
              <TabsContent value="security" className="p-6">
                {/* TODO: Add security settings */}
                <div className="rounded-lg">
                  <h2 className="text-xl font-semibold">Security Settings</h2>
                  <p className="text-gray-400 mt-2">Coming soon...</p>
                </div>
              </TabsContent>
              <TabsContent value="withdraw" className="p-6">
                {/* TODO: Add withdraw settings */}
                <div className="rounded-lg">
                  <h2 className="text-xl font-semibold">Withdraw Settings</h2>
                  <p className="text-gray-400 mt-2">Coming soon...</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
