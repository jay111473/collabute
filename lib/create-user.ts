import { User } from "@/types/convex";
import { generateSecurePassword } from "@/lib/utils/crypto";

export async function createUser(user: Partial<User>) {
  try {
    // Generate a secure random password
    const password = generateSecurePassword();

    // Add password to the user data
    const userData = {
      ...user,
      password,
      type: user.type || "developer", // Ensure type is set
    };

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/users`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      }
    );

    // Check if the response was not successful (not a 2xx status)
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage =
        errorData.message || `Error: ${response.status} ${response.statusText}`;
      throw new Error(errorMessage);
    }

    return response.json();
  } catch (error) {
    console.error("User creation failed:", error);
    throw error; // Re-throw to be handled by the caller
  }
}
