"use server";

import type { LoginResponse } from "@/types/auth.types";
import { cookies } from "next/headers";

export const signinAction = async (
  _prevState: unknown,
  formData: FormData
): Promise<LoginResponse | { error: string }> => {
  const email = formData.get("email") as string | null;
  const password = formData.get("password") as string | null;

  try {
    const res = await fetch(
      process.env.NEXT_PUBLIC_API_URL + "/api/users/login",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      }
    );
    const data = await res.json();
    if (!res.ok || !data.success) {
      return { error: data.message || "Failed to sign in" };
    }
    if (data.token) {
      const cookieStore = await cookies();
      cookieStore.set("token", data.token, { path: "/", httpOnly: true });
    }
    return {
      success: true,
      message: data.message || "Signed in successfully!",
      user: data.user,
      token: data.token,
    };
  } catch {
    return { error: "Failed to sign in" };
  }
};
