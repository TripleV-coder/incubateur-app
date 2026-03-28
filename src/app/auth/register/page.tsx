import RegisterForm from "./register-form";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const params = await searchParams;
  return <RegisterForm callbackUrl={params.callbackUrl ?? "/dashboard"} />;
}
