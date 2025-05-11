import { getUser } from "@/lib/get-user";

export async function useIsAuthenticated() {
  const user = await getUser();
  return user ? true : false;
}
