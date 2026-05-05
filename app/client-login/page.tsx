import AuthLoginForm from "@/components/AuthLoginForm";

export default function ClientLoginPage() {
  return (
    <AuthLoginForm
      title="Customer Portal Login"
      description="Sign in to your client portal to view portal information shared by your credit repair team."
      submitLabel="Sign In"
      alternateHref="/login"
      alternateLabel="Business Login"
    />
  );
}
