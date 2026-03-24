import PageLayout from "@/components/PageLayout";
import Card from "@/components/ui/Card";

export const metadata = {
  title: "About | Shamrock Art Studio",
  description:
    "Shamrock Art Studio is a digital-first gallery: immersive presentation, restrained copy, and clear paths for inquiry.",
};

const principles = [
  {
    title: "Digital-native",
    body:
      "The website is the primary exhibition—not a brochure for a room elsewhere. Every layout decision assumes screens first.",
  },
  {
    title: "Restraint as luxury",
    body:
      "Typography stays sharp, copy stays quiet, and artwork holds the frame. Silence reads expensive.",
  },
  {
    title: "Frictionless inquiry",
    body:
      "Collectors shouldn’t hunt for a contact path. Acquisition, commissions, and previews sit one calm gesture away.",
  },
];

export default function AboutPage() {
  return (
    <PageLayout
      eyebrow="Studio"
      title="About"
      subtitle="A gallery without a street address—built for collectors who live in inboxes, mood boards, and full-screen tabs."
      width="full"
    >
      <p className="max-w-3xl text-lg leading-relaxed text-stone-200/95 sm:text-xl sm:leading-8">
        Shamrock Art Studio exists at the intersection of{" "}
        <span className="text-gradient-hero-subtle not-italic">
          exhibition design
        </span>{" "}
        and product craft. We treat the browser like a light-controlled room:
        contrast, pacing, and negative space are part of the work—not decoration
        around it.
      </p>

      <div className="grid gap-5 md:grid-cols-2">
        <Card variant="emerald" title="Operating model">
          <p className="mt-4 font-serif text-2xl font-medium leading-snug tracking-[-0.02em] text-stone-100 sm:text-3xl">
            Online-first drops, private previews, and commissions—without
            pretending the internet is a substitute for craft.
          </p>
          <p className="mt-5 text-sm leading-7 text-stone-200/85">
            The studio is designed for a split audience: curators who need
            clarity, collectors who want atmosphere, and interiors teams who
            need files, dimensions, and confidence—fast.
          </p>
        </Card>
        <Card variant="emerald" className="flex flex-col justify-between" title="In one line">
          <div>
            <p className="mt-4 font-serif text-xl font-medium italic leading-relaxed text-stone-100/95 sm:text-2xl">
              “Make the site feel like a private viewing—open to the world, but
              never loud.”
            </p>
          </div>
          <p className="mt-8 text-xs uppercase tracking-[0.28em] text-slate-500">
            — studio brief, Shamrock
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

      <p className="max-w-2xl border-l-2 border-amber-400/25 pl-6 text-sm leading-7 text-stone-300/90">
        This site ships as a cinematic shell—swap in your statement, press, and
        biography as the work matures. The architecture is already tuned for a
        premium launch: minimal noise, maximum signal.
      </p>
    </PageLayout>
  );
}
