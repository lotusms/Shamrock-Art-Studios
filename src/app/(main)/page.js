import HomeCollectionPreview from "@/components/home/HomeCollectionPreview";
import HomeHero from "@/components/home/HomeHero";
import HomePageDecor from "@/components/home/HomePageDecor";
import HomeStudioAbout from "@/components/home/HomeStudioAbout";
import {
  pickPortraitHeroProducts,
  pickRecentCatalogProducts,
} from "@/lib/catalogSort";
import { getCatalogProducts } from "@/lib/printful/catalog";

const studioNotes = [
  "Digital-first exhibitions with no physical storefront.",
  "Private collector previews, commissions, and drops online.",
  "A clean, cinematic presentation built to make the work feel premium.",
];

export default async function Home() {
  const catalog = await getCatalogProducts();
  const heroProducts = pickPortraitHeroProducts(catalog, 3);
  const collectionPreviewProducts = pickRecentCatalogProducts(catalog, 6);

  return (
    <main className="pt-16">
      <HomePageDecor />
      <HomeHero heroProducts={heroProducts} />

      <div className="mx-auto mb-10 h-0.5 max-w-5xl bg-slate-200/20" />

      <HomeCollectionPreview initialProducts={collectionPreviewProducts} />
      <HomeStudioAbout notes={studioNotes} />
    </main>
  );
}
