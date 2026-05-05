import AuthLoginForm from "@/components/AuthLoginForm";

export default function LoginPage() {
  return (
    <AuthLoginForm
      title="Business Login"
      description="Sign in to manage disputes, clients, billing, and company settings."
      submitLabel="Sign In"
      alternateHref="/client-login"
      alternateLabel="Customer Portal Login"
      redirectTo="/dashboard"
      showForgotPassword
    />
  );
}
