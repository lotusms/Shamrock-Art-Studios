import { sitePageTitle } from "@/config";

export const metadata = {
  title: sitePageTitle("Create account"),
  robots: { index: true, follow: true },
};

export default function RegisterLayout({ children }) {
  return children;
}
