import axios from "axios";
import { setCookie } from "cookies-next";
import { z } from "zod";

export const loginformSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" }),
});

interface LoginOptions {
  skipRedirect?: boolean;
}

export const login = async (
  values: z.infer<typeof loginformSchema>,
  router: any,
  options?: LoginOptions
) => {
  await axios
    .post(`${process.env.NEXT_PUBLIC_API_URL}/api/users/login`, values)
    .then((res) => {
      // Assuming the server sets HttpOnly cookies for us
      setCookie("token", res.data.token);
      setCookie("userid", res.data.user.id);
      // Set a flag in a cookie to indicate the user is logged in
      setCookie("isLoggedIn", "true");
      console.log(res.data);

      // Only redirect if skipRedirect is not true
      if (!options?.skipRedirect) {
        router.push("/dashboard");
      }

      return "Successfully logged in!";
    })
    .catch((err) => {
      console.log(err);
      return "Failed to log in. Please try again.";
    });
};
