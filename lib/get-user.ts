import { User } from "@/types/dashboard";
import axios from "axios";

export async function getUser(id: string, token: string): Promise<User> {
  
  try {
    const response = await axios.get<User>(
      `${process.env.NEXT_PUBLIC_API_URL}/api/users/${id}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response?.data;
  } catch (error) {
    console.error("Error fetching user:", error);
    throw new Error("Failed to fetch user data");
  }
}
