import Link from "next/link";

const footerLinks = [
  { href: "/login", label: "Login" },
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/terms-of-use", label: "Terms of Use" },
  {
    href: "mailto:info@lotusmarketingsolutions.com",
    label: "Technical Support",
    external: true,
  },
];

export default function SiteFooter() {
  return (
    <footer className="relative z-10 mt-auto w-full border-t border-white/[0.06] bg-slate-950/80 py-12 backdrop-blur-md supports-[backdrop-filter]:bg-slate-950/70">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-6 sm:flex-row sm:items-end sm:justify-between sm:px-10 lg:px-12">
        <div>
          <p className="font-serif text-lg font-medium tracking-[-0.02em] text-stone-100">
            Shamrock Art Studio
          </p>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-slate-500">
            Contemporary wall art and studio goods—online-first, collector-ready.
          </p>
        </div>
        <nav aria-label="Footer" className="flex flex-wrap gap-x-8 gap-y-3">
          {footerLinks.map((item) => (
            item.external ? (
              <a
                key={item.href}
                href={item.href}
                className="text-xs font-medium uppercase tracking-[0.28em] text-slate-500 transition hover:text-amber-200/90"
              >
                {item.label}
              </a>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className="text-xs font-medium uppercase tracking-[0.28em] text-slate-500 transition hover:text-amber-200/90"
              >
                {item.label}
              </Link>
            )
          ))}
        </nav>
      </div>
      <p className="mx-auto mt-10 max-w-7xl px-6 text-center text-[0.65rem] uppercase tracking-[0.35em] text-slate-600 sm:px-10 lg:px-12">
        © {new Date().getFullYear()} Shamrock Art Studio
      </p>
    </footer>
  );
}
