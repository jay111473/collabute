import { User } from "@/types/dashboard";
import { cookies } from "next/headers";

export async function getUser(depth: number = 1): Promise<User> {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userid")?.value;
  const token = cookieStore.get("token")?.value;
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/users/${userId}?depth=${depth}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.json();
  } catch (error) {
    console.error("Error fetching user:", error);
    throw new Error("Failed to fetch user data");
  }
}
