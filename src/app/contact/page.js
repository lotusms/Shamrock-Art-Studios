import PageLayout from "@/components/PageLayout";

export const metadata = {
  title: "Contact | Shamrock Art Studio",
  description: "Reach Shamrock Art Studio for inquiries, commissions, and previews.",
};

export default function ContactPage() {
  return (
    <PageLayout title="Contact" eyebrow="Inquiries">
      <p>
        Add a form, calendar link, or email here. For now this route proves your
        global menu and multi-page setup.
      </p>
      <p>
        <a
          href="mailto:hello@example.com"
          className="text-amber-200/90 underline decoration-amber-400/40 underline-offset-4 transition hover:text-amber-100"
        >
          hello@example.com
        </a>
      </p>
    </PageLayout>
  );
}
