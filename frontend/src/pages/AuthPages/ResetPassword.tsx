import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import ResetPasswordForm from "../../components/auth/ResetPasswordForm";

export default function ResetPassword() {
  return (
    <>
      <PageMeta
        title="React.js Reset Password Dashboard | SEQ.IST Demonstrator - Next.js Admin Dashboard Template"
        description="This is React.js Reset Password Tables Dashboard page for SEQ.IST Demonstrator - React.js Tailwind CSS Admin Dashboard Template"
      />
      <AuthLayout>
        <ResetPasswordForm />
      </AuthLayout>
    </>
  );
}
