import ContactEmailCta from "@/components/contact/ContactEmailCta";
import ContactHelpfulDetailsCard from "@/components/contact/ContactHelpfulDetailsCard";
import PageLayout from "@/components/PageLayout";
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
          <ContactEmailCta />
          <p className="text-sm leading-7 text-stone-400">
            Typical response: <span className="text-stone-300">2–4 business days</span>. For time-sensitive inquiries, please include that in your subject line.
          </p>
        </div>

        <ContactHelpfulDetailsCard lines={checklist} />
      </div>
    </PageLayout>
  );
}
