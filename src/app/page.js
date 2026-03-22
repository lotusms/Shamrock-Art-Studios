import Image from "next/image";
import Button from "@/components/ui/Button";

const featuredWorks = [
  {
    title: "Landscape",
    artist: "Edgar Degas",
    year: "1892",
    medium: "Oil on canvas",
    image:
      "https://images.metmuseum.org/CRDImages/dp/web-large/DP815958.jpg",
    aspect: "aspect-[4/5]",
    layout: "md:col-span-7 md:row-span-2",
  },
  {
    title: "Portrait of Gerard de Lairesse",
    artist: "Rembrandt",
    year: "1665-67",
    medium: "Oil on canvas",
    image:
      "https://images.metmuseum.org/CRDImages/rl/web-large/DP121332.jpg",
    aspect: "aspect-[4/5]",
    layout: "md:col-span-5",
  },
  {
    title: "Landscape",
    artist: "Ralph Albert Blakelock",
    year: "1885-95",
    medium: "Oil on canvas",
    image:
      "https://images.metmuseum.org/CRDImages/ad/web-large/ap29.35.jpg",
    aspect: "aspect-[16/10]",
    layout: "md:col-span-5",
  },
  {
    title: "Landscape",
    artist: "George Inness",
    year: "1884 or 1889",
    medium: "Oil on canvas",
    image:
      "https://images.metmuseum.org/CRDImages/ad/web-large/DP276951.jpg",
    aspect: "aspect-[16/10]",
    layout: "md:col-span-4",
  },
  {
    title: "Landscape",
    artist: "Albert Pinkham Ryder",
    year: "1897-98",
    medium: "Oil on canvas",
    image:
      "https://images.metmuseum.org/CRDImages/ad/web-large/ap52.199.jpg",
    aspect: "aspect-[4/5]",
    layout: "md:col-span-4",
  },
  {
    title: "Landscape",
    artist: "Liu Yu",
    year: "1680",
    medium: "Hanging scroll",
    image:
      "https://images.metmuseum.org/CRDImages/as/web-large/DP205858_CRD.jpg",
    aspect: "aspect-[3/4]",
    layout: "md:col-span-4",
  },
];

const studioNotes = [
  "Digital-first exhibitions with no physical storefront.",
  "Private collector previews, commissions, and drops online.",
  "A clean, cinematic presentation built to make the work feel premium.",
];

const metrics = [
  { value: "24/7", label: "global viewing" },
  { value: "06", label: "sample works" },
  { value: "100%", label: "online-first" },
];

export default function Home() {
  const heroWork = featuredWorks[0];

  return (
    <main className="relative z-10 overflow-hidden pt-[4.25rem]">
      {/* Subtle film grain + depth */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-2 opacity-[0.04] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />
      <div className="pointer-events-none absolute inset-0 z-0 opacity-90">
        <div className="animate-aura-1 absolute left-0 top-0 h-96 w-96 rounded-full bg-slate-600/22 blur-3xl" />
        <div className="animate-aura-2 absolute right-0 top-24 h-112 w-md rounded-full bg-amber-400/18 blur-3xl" />
        <div className="animate-aura-3 absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-slate-500/18 blur-3xl" />
        <div className="animate-aura-2 absolute right-1/4 top-1/2 h-64 w-64 rounded-full bg-amber-400/20 blur-3xl" />
      </div>

      <section className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl items-center px-6 py-14 sm:px-10 lg:px-12">
        <div className="grid w-full gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
          <div className="flex flex-col justify-center">
            <p className="inline-flex w-fit items-center gap-2 rounded-full border-2 border-slate-600/50 bg-linear-to-r from-slate-700/35 via-amber-400/12 to-slate-700/35 px-4 py-2 text-xs uppercase tracking-[0.32em] text-stone-100 shadow-lg shadow-slate-950/40 ring-2 ring-slate-500/25 backdrop-blur-md">
              <span
                aria-hidden
                className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-400 shadow-[0_0_14px_5px] shadow-amber-400/50"
              />
              Shamrock Art Studio
            </p>
            <h1 className="font-serif mt-6 max-w-5xl text-5xl font-medium leading-[1.05] tracking-[-0.02em] text-stone-100 sm:text-7xl lg:text-[6.5rem]">
              A{" "}
              <span className="text-gradient-hero">future-facing</span> gallery
              for a studio that lives{" "}
              <span className="text-gradient-hero-subtle italic">
                entirely online.
              </span>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-stone-200/90 sm:text-lg">
              Designed for collectors, curators, and interiors-driven clients,
              this experience turns the website into the primary exhibition
              space rather than a brochure for a physical location.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Button href="/work" variant="primary">
                Explore collection
              </Button>
              <Button href="/about" variant="secondary">
                View studio notes
              </Button>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {metrics.map((item) => (
                <div
                  key={item.label}
                  className="rounded-3xl border-2 border-slate-700/40 bg-slate-900/45 p-5 shadow-lg shadow-slate-950/30 backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-amber-400/35 hover:shadow-xl hover:shadow-slate-900/40"
                >
                  <p className="bg-linear-to-br from-white via-stone-100 to-amber-200 bg-clip-text text-3xl font-semibold tracking-[-0.04em] text-transparent">
                    {item.value}
                  </p>
                  <p className="mt-2 text-sm uppercase tracking-[0.22em] text-slate-400">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -left-6 top-12 hidden h-24 w-24 rounded-full border-2 border-slate-600/35 bg-amber-500/8 blur-sm lg:block" />
            <div className="rounded-4xl border-2 border-slate-600/40 bg-linear-to-br from-slate-900/55 to-slate-950/50 p-3 shadow-2xl shadow-slate-950/40 ring-2 ring-slate-500/25 backdrop-blur transition duration-500 hover:ring-amber-400/30 hover:shadow-slate-950/50">
              <div className="relative overflow-hidden rounded-3xl border-2 border-white/15">
                <div className="relative aspect-4/5">
                  <Image
                    src={heroWork.image}
                    alt={`${heroWork.title} by ${heroWork.artist}`}
                    fill
                    preload
                    sizes="(max-width: 1024px) 100vw, 45vw"
                    className="object-cover"
                  />
                </div>
                <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-950/40 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                  <p className="text-xs uppercase tracking-[0.32em] text-slate-400">
                    Featured work
                  </p>
                  <div className="mt-3 flex items-end justify-between gap-6">
                    <div>
                      <h2 className="font-serif text-2xl font-medium tracking-[-0.02em] text-stone-100 sm:text-3xl">
                        {heroWork.title}
                      </h2>
                      <p className="mt-2 text-sm text-stone-200/85">
                        {heroWork.artist} • {heroWork.year}
                      </p>
                    </div>
                    <p className="hidden text-right text-xs uppercase tracking-[0.22em] text-amber-300/80 sm:block">
                      Dev sample
                      <br />
                      via The Met
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border-2 border-slate-700/35 bg-slate-900/50 p-5 backdrop-blur-sm">
                <p className="text-xs uppercase tracking-[0.28em] text-amber-300/90">
                  Positioning
                </p>
                <p className="mt-3 text-sm leading-7 text-stone-200/90">
                  Think less traditional gallery wall, more collectible digital
                  publication with a luxury retail rhythm.
                </p>
              </div>
              <div className="rounded-3xl border-2 border-slate-700/35 bg-slate-900/50 p-5 backdrop-blur-sm">
                <p className="text-xs uppercase tracking-[0.28em] text-amber-300/90">
                  Artwork source
                </p>
                <p className="mt-3 text-sm leading-7 text-stone-200/90">
                  Current images are open-access museum works used only as
                  development placeholders until original studio pieces are
                  uploaded.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="collection"
        className="relative mx-auto w-full max-w-7xl px-6 pb-10 sm:px-10 lg:px-12"
      >
        <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-slate-400">
              Collection preview
            </p>
            <h2 className="font-serif mt-4 max-w-3xl text-3xl font-medium tracking-[-0.02em] text-stone-100 sm:text-5xl">
              A modular gallery grid with{" "}
              <span className="text-gradient-hero-subtle not-italic">
                cinematic
              </span>{" "}
              cropping and editorial spacing.
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-stone-200/85">
            The layout is intentionally asymmetric so the homepage feels like a
            curated drop. Replace these works with your own paintings and the
            structure will already support a polished launch.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-12">
          {featuredWorks.map((work, index) => (
            <article
              key={`${work.title}-${work.artist}`}
              className={`group ${work.layout} overflow-hidden rounded-4xl border-2 border-slate-700/30 bg-slate-900/35 p-3 shadow-lg shadow-slate-950/35 backdrop-blur transition duration-500 hover:-translate-y-1 hover:border-amber-400/30 hover:shadow-2xl hover:shadow-slate-950/50`}
            >
              <div className="relative h-full overflow-hidden rounded-3xl border-2 border-white/15">
                <div className={`relative ${work.aspect} min-h-full`}>
                  <Image
                    src={work.image}
                    alt={`${work.title} by ${work.artist}`}
                    fill
                    sizes={
                      index === 0
                        ? "(max-width: 768px) 100vw, 58vw"
                        : "(max-width: 768px) 100vw, 33vw"
                    }
                    className="object-cover transition duration-700 group-hover:scale-[1.03]"
                  />
                </div>
                <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-950/40 to-transparent opacity-90" />
                <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                    {work.medium}
                  </p>
                  <div className="mt-3 flex items-end justify-between gap-4">
                    <div>
                      <h3 className="font-serif text-xl font-medium tracking-[-0.02em] text-stone-100">
                        {work.title}
                      </h3>
                      <p className="mt-1 text-sm text-stone-200/85">
                        {work.artist}
                      </p>
                    </div>
                    <p className="text-sm text-amber-300/80">{work.year}</p>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section
        id="about"
        className="mx-auto grid w-full max-w-7xl gap-6 px-6 py-14 sm:px-10 lg:grid-cols-[0.95fr_1.05fr] lg:px-12 lg:py-20"
      >
        <div className="rounded-4xl border-2 border-slate-600/35 bg-linear-to-br from-slate-800/40 via-slate-900/35 to-slate-950/50 p-8 shadow-xl shadow-slate-950/35 ring-2 ring-slate-500/20 backdrop-blur-md">
          <p className="text-xs uppercase tracking-[0.32em] text-amber-300">
            Studio direction
          </p>
          <h2 className="font-serif mt-4 text-3xl font-medium tracking-[-0.02em] text-stone-100 sm:text-4xl">
            <span className="text-gradient-hero-subtle not-italic">
              Modern, immersive,
            </span>{" "}
            and intentionally unbound from a physical address.
          </h2>
          <p className="mt-5 max-w-xl text-sm leading-8 text-stone-200/90">
            The strongest direction for this brand is a digital gallery that
            feels exclusive but frictionless: sharp typography, restrained copy,
            immersive artwork, and clear paths for inquiry, acquisition, and
            commissions.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {studioNotes.map((note) => (
            <article
              key={note}
              className="rounded-4xl border-2 border-slate-700/30 bg-slate-900/50 p-6 transition duration-300 hover:border-amber-400/35 hover:bg-slate-800/55 hover:shadow-lg hover:shadow-slate-950/30"
            >
              <p className="text-sm leading-7 text-stone-200/90">{note}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
