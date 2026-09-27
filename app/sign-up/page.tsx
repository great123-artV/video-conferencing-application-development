import { redirect } from "next/navigation"
import AuthForm from "@/components/auth-form"
import { getSession } from "@/lib/auth"

export default async function SignUpPage() {
  if ((await getSession())?.user) redirect("/")
  return <main className="flex min-h-screen items-center justify-center bg-[#f8f9fb] p-5"><AuthForm mode="sign-up" /></main>
}
