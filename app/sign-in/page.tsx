import { redirect } from "next/navigation"
import AuthForm from "@/components/auth-form"
import { getSession } from "@/lib/auth"

export default async function SignInPage() {
  if ((await getSession())?.user) redirect("/")
  return <main className="flex min-h-screen items-center justify-center bg-[#f6f8fc] p-5"><AuthForm mode="sign-in" /></main>
}
