import { User } from "@/types/dashboard";
import axios from "axios";

export async function getUser(token: string): Promise<any> {
  try {
    const response = await axios.get<User>(
      `${process.env.NEXT_PUBLIC_API_URL}/api/users/me`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response?.data;
  } catch (error) {
    console.error("Error fetching user:", error);
    throw new Error("Failed to fetch user data");
  }
}
