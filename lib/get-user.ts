import { User } from "@/types/dashboard";
import { cookies } from "next/headers";

export async function getUser(depth: number = 1): Promise<User> {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userid")?.value;
  const token = cookieStore.get("token")?.value;

  // Check if we have required authentication data
  if (!userId || !token) {
    throw new Error("Authentication required - missing user credentials");
  }

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/users/${userId}?depth=${depth}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Authentication failed - invalid or expired token");
      }
      if (response.status === 404) {
        throw new Error("User not found");
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching user:", error);
    throw error instanceof Error
      ? error
      : new Error("Failed to fetch user data");
  }
}
