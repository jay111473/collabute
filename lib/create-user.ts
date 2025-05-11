import { User } from "@/types/dashboard";

export async function createUser(user: Partial<User>) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/users`,
      {
        method: "POST",
        body: JSON.stringify(user),
      }
    );
    return response.json();
  } catch (error) {
    console.error(error);
  }
}
