import { getUser } from "@/lib/get-user";
import { cookies } from "next/headers";

export async function useIsAuthenticated() {
  const token = (await cookies()).get("token")?.value;
  const data = await getUser(token || "");
  const user = data?.user;
  return user ? true : false;
}
