import PageLayout from "@/components/PageLayout";
import ShopCatalogClient from "@/components/shop/ShopCatalogClient";

export const metadata = {
  title: "Shop | Shamrock Art Studio",
  description:
    "Original works available for acquisition—priced transparently, shipped with care.",
};

export const dynamic = "force-dynamic";

export default function ShopPage() {
  return (
    <PageLayout
      eyebrow="Collection"
      title="Shop"
      subtitle="Shop modern wall art and creative accessories by Shamrock Art Studio, including prints, posters, bags, keychains, and limited-edition studio pieces."
      width="full"
    >
      <ShopCatalogClient />
    </PageLayout>
  );
}
