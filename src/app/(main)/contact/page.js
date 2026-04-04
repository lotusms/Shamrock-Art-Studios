import PageLayout from "@/components/PageLayout";
import Card from "@/components/ui/Card";
import { orgName, sitePageTitle } from "@/config";

export const metadata = {
  title: sitePageTitle("Contact"),
  description: `Inquire about original artwork, canvas prints, and special requests at ${orgName}.`,
};

const checklist = [
  "The artwork title or a screenshot of the piece",
  "Whether you are interested in a canvas or a print",
  "Your shipping location",
  "Your timeline or any special requests",
];

export default function ContactPage() {
  return (
    <PageLayout
      eyebrow="Art Inquiries"
      title={`Contact ${orgName}`}
      subtitle=""
      width="full"
    >
      <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-12 w-full">
        <div className="min-w-0 flex-11 space-y-6">
          <p className="leading-relaxed text-stone-200/95 sm:leading-8">
            Get in touch with {orgName} for questions about original artwork, canvas prints, special requests, availability, or shipping. We welcome inquiries from collectors, gift buyers, and anyone interested in learning more about the artist’s work.
            <br />
            <br />
            As an online art studio, all contact is handled by email so we can keep artwork details, reference images, pricing, and shipping information in one place. Every message is reviewed with care, and we do our best to respond as promptly as possible.
          </p>
          <a
            href="mailto:studio@shamrockartstudio.com"
            className="group inline-flex w-fit flex-col gap-1 rounded-2xl border-2 border-slate-600/45 bg-slate-900/50 px-6 py-5 shadow-lg shadow-slate-950/35 transition hover:border-amber-400/35 hover:bg-slate-800/50"
          >
            <span className="text-xs uppercase tracking-[0.28em] text-slate-400">
              Write
            </span>
            <span className="font-serif text-2xl font-medium tracking-[-0.02em] text-stone-100 transition group-hover:text-amber-100 sm:text-3xl">
              studio@shamrockartstudio.com
            </span>
            <span className="text-sm text-stone-400">
              For artwork inquiries, print questions, and order support.
            </span>
          </a>
          <p className="text-sm leading-7 text-stone-400">
            Typical response: <span className="text-stone-300">2–4 business days</span>. For time-sensitive inquiries, please include that in your subject line.
          </p>
        </div>

        <Card
          variant="inset"
          title="Helpful Details to Include"
          titleTag="h4"
          className="min-w-0 flex-9"
        >
          <p className="mt-8 text-sm leading-7 text-stone-200/90">To help us respond more clearly, please include:</p>
          <ul className="mt-5 space-y-4 text-sm leading-4 text-stone-200/90">
            {checklist.map((line) => (
              <li key={line} className="flex gap-3">
                <span
                  className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400/80 shadow-[0_0_10px] shadow-amber-400/40"
                  aria-hidden
                />
                <span>{line}</span>
              </li>
            ))}
          </ul>
          <p className="mt-8 text-center px-12 border-t border-white/5 pt-6 text-xs uppercase tracking-[0.22em] text-slate-500">
            Special inquiries are reviewed based on artist&apos;s schedule. 
          </p>
        </Card>
      </div>
    </PageLayout>
  );
}
