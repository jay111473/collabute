"use server";

import type { LoginFormData, LoginResponse } from "@/types/auth.types";
import { login } from "../auth-server";
import { cookies } from "next/headers";

export const signinAction = async (
  _prevState: unknown,
  formData: FormData
): Promise<LoginResponse | { error: string }> => {
  const email = formData.get("email") as string | null;
  const password = formData.get("password") as string | null;
  const cookieStore = await cookies();
  const payload: LoginFormData = {
    email: email as string,
    password: password as string,
  };

  try {
    const response = await login(payload);
    cookieStore.set("token", response.token);
    cookieStore.set("userid", JSON.stringify(response.user.id));
    return {
      success: true,
      message: "Logged in successfully",
      user: response.user,
      token: response.token,
    };
  } catch (error) {
    console.error("Login error:", error);
    return { error: "Failed to sign in" };
  }
};
