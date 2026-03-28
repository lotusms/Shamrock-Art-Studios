import PageLayout from "@/components/PageLayout";

const companyName = "Shamrock Art Studio";

export const metadata = {
  title: "Terms of Use | Shamrock Art Studio",
  description: `Terms of Use for ${companyName}.`,
};

export default function TermsOfUsePage() {
  return (
    <PageLayout
      eyebrow="Legal"
      title="Terms of Use"
      subtitle="Introduction to Our Terms of Use"
    >
      <div className="space-y-7">
        <p>
          By continuing to browse and use this website you are agreeing to
          comply with and be bound by the terms and conditions described below,
          which governs {companyName}&apos;s relationship with you in
          relation to this website.
        </p>

        <section>
          <h2 className="font-serif text-2xl text-stone-100">Age</h2>
          <p className="mt-3">
            You must be at least 18 years of age to use this website for
            business operations. Visitors under 18 years of age may use this
            website for school research material only, if applies.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-stone-100">
            License to Use This Website
          </h2>
          <p className="mt-3">
            Unless otherwise stated, {companyName} and/or its
            licensors own the intellectual property rights in the website and
            material on the website. Subject to the license below, all these
            intellectual property rights are reserved.
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-6">
            <li>Do not republish material from this website.</li>
            <li>Do not sell, rent, or sub-license material from the website.</li>
            <li>Do not reproduce website material for commercial purposes.</li>
            <li>Do not edit or redistribute material unless expressly permitted.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-stone-100">Acceptable Use</h2>
          <p className="mt-3">
            You must not use this website in any way that causes, or may cause,
            damage to the website or impairment of the availability or
            accessibility of the website; or in any way which is unlawful,
            illegal, fraudulent, or harmful.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-stone-100">No Warranties</h2>
          <p className="mt-3">
            This website is provided &quot;as is&quot; without any representations
            or warranties, express or implied.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-stone-100">
            Limitations Of Liabilities
          </h2>
          <p className="mt-3">
            {companyName} will not be liable to you in relation to
            the contents of, or use of, or otherwise in connection with this
            website, to the maximum extent permitted by law.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-stone-100">
            Law &amp; Jurisdiction
          </h2>
          <p className="mt-3">
            These terms and conditions will be governed by and construed in
            accordance with your local state&apos;s law and federal laws whenever
            they may override.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-stone-100">Contacting Us</h2>
          <p className="mt-3">
            If there are any questions regarding this terms of use you may
            contact us using the information below.
          </p>
          <p className="mt-3">
            https://www.shamrockartstudio.com/
            <br />
            info@shamrockartstudio.com
          </p>
        </section>
      </div>
    </PageLayout>
  );
}
