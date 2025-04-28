"use server";

import type { LoginFormData, LoginResponse } from "@/types/auth.types";
import { login } from "../auth-server";
import { redirect } from "next/navigation";
export const signinAction = async (
  _prevState: unknown,
  formData: FormData
): Promise<LoginResponse | { error: string }> => {
  const email = formData.get("email") as string | null;
  const password = formData.get("password") as string | null;
  const payload: LoginFormData = {
    email: email as string,
    password: password as string,
  };
  await login(payload);
  redirect("/dashboard");
};
