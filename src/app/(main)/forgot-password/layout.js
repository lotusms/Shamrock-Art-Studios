import { sitePageTitle } from "@/config";

export const metadata = {
  title: sitePageTitle("Forgot password"),
  robots: { index: false, follow: false },
};

export default function ForgotPasswordLayout({ children }) {
  return children;
}
