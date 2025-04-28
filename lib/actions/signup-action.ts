"use server";

import type { CreateAccountResponse } from "@/types/auth.types";

export const signupAction = async (
  _prevState: unknown,
  formData: FormData
): Promise<CreateAccountResponse | { error: string }> => {
  const email = formData.get("email") as string | null;
  const password = formData.get("password") as string | null;
  const name = formData.get("name") as string | null;
  const type = formData.get("type") as string | null;

  // Debug: log all formData entries
  for (const [key, value] of formData.entries()) {
    console.log(`formData entry: ${key} =`, value);
  }

  try {
    const res = await fetch(process.env.NEXT_PUBLIC_API_URL + "/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name, type }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      return { error: data.message || "Failed to sign up" };
    }
    return {
      success: true,
      message: data.message || "Account created successfully!",
      userId: data.userId,
    };
  } catch (error) {
    console.log("error", error);
    return { error: "Failed to sign up" };
  }
};
