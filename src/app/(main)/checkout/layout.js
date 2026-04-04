import { orgName, sitePageTitle } from "@/config";

export const metadata = {
  title: sitePageTitle("Checkout"),
  description: `Shipping and payment details for your ${orgName} order.`,
};

export default function CheckoutLayout({ children }) {
  return children;
}
