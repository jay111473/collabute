import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const {
    name,
    type,
    email,
    password,
    phoneNumber,
    developerFields,
    startupFields,
  } = await request.json();
  try {
    const response = await fetch(process.env.NEXT_PUBLIC_API_URL + "/api/users", {
      method: "POST",
      headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name,
      type,
      email,
      password,
      phoneNumber,
      developerFields,
      startupFields,
    }),
    });
    console.log(response);
    const user = await response.json();
    console.log(user);
    return NextResponse.json(user);
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}
