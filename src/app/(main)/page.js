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
  {
    title: ["Online", "Gallery"],
    content: "Browse original artwork and canvas prints from anywhere.",
  },
  {
    title: ["Multiple", "Mediums"],
    content: "Discover watercolor, oil, and pencil art across a wide range of styles.",
  },
  {
    title: ["Direct", "Shipping"],
    content: "Order artwork online and have it shipped directly to the buyer.",
  },
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

      <div className="mx-auto h-0.5 max-w-5xl bg-slate-200/20" />

      <HomeStudioAbout notes={studioNotes} />
    </main>
  );
}
