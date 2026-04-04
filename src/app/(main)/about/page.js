import AboutStudioCards from "@/components/about/AboutStudioCards";
import PageLayout from "@/components/PageLayout";
import { orgName, sitePageTitle } from "@/config";

export const metadata = {
  title: sitePageTitle("About"),
  description: `${orgName} is a digital-first gallery: immersive presentation, restrained copy, and clear paths for inquiry.`,
};

const principles = [
  {
    title: "Original Artwork and Prints",
    body:
      "Explore original paintings, drawings, and canvas prints created in watercolor, oil, and pencil across both abstract and realistic styles.",
  },
  {
    title: "Online Gallery Experience",
    body:
      "Browse the collection from anywhere through a clean, immersive online gallery designed to highlight the artwork and make discovery easy.",
  },
  {
    title: "Shipping and Special Requests",
    body:
      "Artwork is shipped directly to buyers, and special requests may be available for collectors looking for something personal and one of a kind. Please contact us for more information.",
  },
];

export default function AboutPage() {
  return (
    <PageLayout
      eyebrow="Studio"
      title={`About ${orgName}`}
      subtitle=""
      width="full"
    >
      <p className="leading-relaxed text-stone-200/95 sm:leading-8">
        {orgName} is an online art studio and gallery created to share original artwork, canvas prints, and a growing creative portfolio with collectors and art lovers everywhere. Founded as a home-based studio, {orgName} is the creative space of a young emerging artist developing her voice across a wide range of subjects, mediums, and styles. From expressive abstract paintings to detailed realistic artwork, the studio reflects a passion for experimentation, growth, and meaningful visual storytelling.
        <br />
        <br />
        This website serves as both an online gallery and an artist portfolio, making it easy to explore available work, discover new pieces, and support the artist’s journey. Every purchase helps fund future materials, new projects, and continued artistic development.
      </p>

      <AboutStudioCards orgName={orgName} principles={principles} />

      <p className="border-l-2 border-amber-400/25 pl-6 text-sm leading-7 text-stone-300/90">
        {orgName} continues to grow as an online destination for original art, canvas prints, and emerging creative work, with new pieces added as the artist’s portfolio expands.
      </p>
    </PageLayout>
  );
}
