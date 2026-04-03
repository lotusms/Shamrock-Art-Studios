import PrimaryButton from "@/components/ui/PrimaryButton";
import SecondaryButton from "@/components/ui/SecondaryButton";
import HomeHeroArtRotator from "@/components/home/HomeHeroArtRotator";

export default function HomeHero({ heroProducts = [] }) {
  const hasSlides = Array.isArray(heroProducts) && heroProducts.length > 0;

  return (
    <section className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl items-center px-6 py-14 sm:px-10 lg:px-12">
      <div className="grid w-full gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
        <div className="flex flex-col justify-start">
          <p className="inline-flex w-fit items-center gap-2 rounded-full border-2 border-slate-600/50 bg-linear-to-r from-slate-700/35 via-amber-400/12 to-slate-700/35 px-4 py-2 text-xs uppercase tracking-[0.32em] text-stone-100 shadow-lg shadow-slate-950/40 ring-2 ring-slate-500/25 backdrop-blur-md">
            <span
              aria-hidden
              className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-400 shadow-[0_0_14px_5px] shadow-amber-400/50"
            />
            Shamrock Art Studio
          </p>
          <h1 className="font-serif mt-6 max-w-5xl text-5xl font-medium leading-[1.05] tracking-[-0.02em] text-stone-100 sm:text-7xl lg:text-[6.5rem]">
            <span className="text-gradient-hero">Wall art</span>
            {" "}and canvas prints{" "}
            <span className="text-gradient-hero-subtle italic">
              ready for any space.
            </span>
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-stone-200/90 sm:text-lg">
            Shop wall art and canvas prints from Shamrock Art Studio, with sizes
            and finishes for living rooms, bedrooms, and offices. Browse the
            collection to compare pieces and order on demand with transparent
            shipping.
          </p>

          <div className="mt-8 flex flex-col gap-2 sm:flex-row justify-around">
            <PrimaryButton href="/shop">Explore collection</PrimaryButton>
            <SecondaryButton href="/about" className="px-2 py-3.5">
              View studio notes
            </SecondaryButton>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -left-6 top-12 hidden h-24 w-24 rounded-full border-2 border-slate-600/35 bg-amber-500/8 blur-sm lg:block" />
          {hasSlides ? (
            <HomeHeroArtRotator
              key={heroProducts.map((p) => p.id).join("-")}
              products={heroProducts}
            />
          ) : (
            <div className="rounded-4xl border-2 border-slate-600/40 bg-linear-to-br from-slate-900/55 to-slate-950/50 p-3 shadow-2xl shadow-slate-950/40 ring-2 ring-slate-500/25 backdrop-blur transition duration-500 hover:ring-amber-400/30 hover:shadow-slate-950/50">
              <div className="flex min-h-[min(70vw,28rem)] flex-col items-center justify-center gap-6 rounded-3xl border-2 border-dashed border-slate-600/50 bg-slate-950/35 px-8 py-14 text-center sm:min-h-[28rem]">
                <p className="max-w-sm text-sm leading-7 text-stone-300/90">
                  Connect Printful for rotating hero art, or open the shop.
                </p>
                <PrimaryButton href="/shop">Browse the shop</PrimaryButton>
              </div>
            </div>
          )}

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border-2 border-slate-700/35 bg-slate-900/50 p-4 backdrop-blur-sm sm:p-5">
              <p className="text-xs uppercase tracking-[0.28em] text-amber-300/90">
                Positioning
              </p>
              <p className="mt-2 text-sm leading-snug text-stone-200/90">
                Gallery presentation, retail pace.
              </p>
            </div>
            <div className="rounded-3xl border-2 border-slate-700/35 bg-slate-900/50 p-4 backdrop-blur-sm sm:p-5">
              <p className="text-xs uppercase tracking-[0.28em] text-amber-300/90">
                Artwork source
              </p>
              <p className="mt-2 text-sm leading-snug text-stone-200/90">
                Up to three newest portrait pieces from Printful, on rotation.
                Otherwise the newest listings.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
