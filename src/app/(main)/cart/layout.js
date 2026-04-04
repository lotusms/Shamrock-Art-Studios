import { sitePageTitle } from "@/config";

export const metadata = {
  title: sitePageTitle("Cart"),
  description: "Review your selected works before checkout.",
};

export default function CartLayout({ children }) {
  return children;
}
