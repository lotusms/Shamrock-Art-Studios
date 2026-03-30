import HomeCollectionPreview from "@/components/home/HomeCollectionPreview";
import HomeHero from "@/components/home/HomeHero";
import HomePageDecor from "@/components/home/HomePageDecor";
import HomeStudioAbout from "@/components/home/HomeStudioAbout";
import { featuredWorks, studioNotes } from "@/data/homePage";

export default function Home() {
  const heroWork = featuredWorks[0];

  return (
    <main className="pt-16">
      <HomePageDecor />
      <HomeHero heroWork={heroWork} />

      <div className="mx-auto mb-10 h-0.5 max-w-5xl bg-slate-200/20" />

      <HomeCollectionPreview works={featuredWorks} />
      <HomeStudioAbout notes={studioNotes} />
    </main>
  );
}
