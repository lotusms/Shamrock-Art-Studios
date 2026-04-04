import PageLayout from "@/components/PageLayout";
import Card from "@/components/ui/Card";

export const metadata = {
  title: "About | Shamrock Art Studio",
  description:
    "Shamrock Art Studio is a digital-first gallery: immersive presentation, restrained copy, and clear paths for inquiry.",
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
      title="About Shamrock Art Studio"
      subtitle=""
      width="full"
    >
      <p className="leading-relaxed text-stone-200/95 sm:leading-8">
        Shamrock Art Studio is an online art studio and gallery created to share original artwork, canvas prints, and a growing creative portfolio with collectors and art lovers everywhere. Founded as a home-based studio, Shamrock Art Studio is the creative space of a young emerging artist developing her voice across a wide range of subjects, mediums, and styles. From expressive abstract paintings to detailed realistic artwork, the studio reflects a passion for experimentation, growth, and meaningful visual storytelling.
        <br />
        <br />
        This website serves as both an online gallery and an artist portfolio, making it easy to explore available work, discover new pieces, and support the artist’s journey. Every purchase helps fund future materials, new projects, and continued artistic development.
      </p>

      <div className="grid gap-5 md:grid-cols-2">
        <Card variant="inset" title="Online Art Studio">
          <p className="mt-5 leading-7 text-stone-200/85">
          Shamrock Art Studio operates as an online-first gallery, offering original artwork, canvas prints, and special requests without the need for a physical storefront. This allows collectors to browse and buy art online while receiving work shipped directly to their home.
          </p>
        </Card>

        <Card variant="inset" className="flex flex-col justify-between" title="In one line">
          <div>
            <p className="mt-4 font-serif text-xl font-medium italic leading-relaxed text-stone-100/95 sm:text-2xl">
              “Original art, prints, and creative growth shared through a modern online gallery.”
            </p>
          </div>
          <p className="flex justify-end text-xs uppercase tracking-[0.28em] text-slate-500">
            — Jas Perez, Artist
          </p>
        </Card>
      </div>

      <div>
        <p className="text-xs uppercase tracking-[0.32em] text-slate-400">
          Principles
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {principles.map((item) => (
            <Card variant="amber" title={item.title} key={item.title}>
              <p className="mt-3 text-sm leading-7 text-stone-200/90">{item.body}</p>
            </Card>
          ))}
        </div>
      </div>

      <p className="border-l-2 border-amber-400/25 pl-6 text-sm leading-7 text-stone-300/90">
        Shamrock Art Studio continues to grow as an online destination for original art, canvas prints, and emerging creative work, with new pieces added as the artist’s portfolio expands.
      </p>
    </PageLayout>
  );
}
