import { cookies } from "next/headers";
import { getUser } from "@/lib/get-user";
import DashboardLayout from "@/components/dashboard/dashboard-layout";
import ProfileForm from "@/components/dashboard/profile/profile-form";

const Profile = async () => {
  const token = (await cookies()).get("token")?.value;
  const data = await getUser(token || "");
  const user = data?.user;

  return (
    <DashboardLayout user={user} title="Profile">
      <div className="flex-1 flex flex-col">
        <ProfileForm user={user} />
      </div>
    </DashboardLayout>
  );
};

export default Profile;
