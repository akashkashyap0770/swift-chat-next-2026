// This page just redirects users to the right place:
// - Not logged in? → Go to /login
// - Logged in? → Go to /chat

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";

export default async function Home() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  // Check if the token is valid
  const user = token ? verifyToken(token) : null;

  if (!user) {
    redirect("/login");
  } else {
    redirect("/chat");
  }
}
