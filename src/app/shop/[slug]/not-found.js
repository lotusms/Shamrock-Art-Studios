import Link from "next/link";
import PageLayout from "@/components/PageLayout";

export default function NotFound() {
  return (
    <PageLayout
      eyebrow="Shop"
      title="Work not found"
      subtitle="That piece may have sold or the link is outdated."
      width="wide"
    >
      <Link
        href="/shop"
        className="inline-flex w-fit rounded-full border-2 border-slate-500/50 bg-slate-900/55 px-8 py-3.5 text-sm font-semibold text-stone-100 transition hover:border-amber-400/45"
      >
        Browse all works
      </Link>
    </PageLayout>
  );
}
