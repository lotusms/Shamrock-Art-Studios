import PageLayout from "@/components/PageLayout";

const companyName = "Shamrock Art Studio";

export const metadata = {
  title: "Privacy Policy | Shamrock Art Studio",
  description: `Privacy Policy for ${companyName}.`,
};

export default function PrivacyPolicyPage() {
  return (
    <PageLayout
      eyebrow="Legal"
      title="Privacy Policy"
      subtitle="Introduction to Our Privacy Policy"
    >
      <div className="space-y-7">
        <p>
          At {companyName}, we are committed to protecting your
          privacy. This privacy policy explains how we collect, use, and
          safeguard your information when you visit our website or use our
          services. By using our site, you consent to the practices outlined in
          this policy.
        </p>
        <section>
          <h2 className="font-serif text-2xl text-stone-100">
            What information do we collect?
          </h2>
          <p className="mt-3">We collect information from you when you respond to a survey.</p>
          <p className="mt-3">
            When ordering or registering on our site, as appropriate, you may
            be asked to enter your name, e-mail address, phone number or name.
            You may, however, visit our site anonymously.
          </p>
        </section>
        <section>
          <h2 className="font-serif text-2xl text-stone-100">
            What do we use your information for?
          </h2>
          <p className="mt-3">
            Any of the information we collect from you may be used in one of
            the following ways:
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-6">
            <li>
              To personalize your experience (your information helps us to
              better respond to your individual needs)
            </li>
            <li>To process transactions</li>
          </ul>
          <p className="mt-3">
            Your information, whether public or private, will not be sold,
            exchanged, transferred, or given to any other company for any
            reason whatsoever, without your consent, other than for the express
            purpose of delivering the purchased product or service requested.
          </p>
        </section>
        <section>
          <h2 className="font-serif text-2xl text-stone-100">
            How do we protect your information?
          </h2>
          <p className="mt-3">
            We implement a variety of security measures to maintain the safety
            of your personal information when you place an order or enter,
            submit, or access your personal information.
          </p>
          <p className="mt-3">
            We offer the use of a secure server. All supplied
            sensitive/credit information is transmitted via Secure Socket Layer
            (SSL) technology and then encrypted into our Payment gateway
            providers database only to be accessible by those authorized with
            special access rights to such systems, and are required to keep the
            information confidential.
          </p>
          <p className="mt-3">
            After a transaction, your private information (credit cards, social
            security numbers, financials, etc.) will not be stored on our
            servers.
          </p>
        </section>
        <section>
          <h2 className="font-serif text-2xl text-stone-100">
            Do we use cookies?
          </h2>
          <p className="mt-3">We do not use cookies.</p>
        </section>
        <section>
          <h2 className="font-serif text-2xl text-stone-100">
            Do we disclose any information to outside parties?
          </h2>
          <p className="mt-3">
            We do not sell, trade, or otherwise transfer to outside parties
            your personally identifiable information.
          </p>
          <p className="mt-3">
            This does not include trusted third parties who assist us in
            operating our website, conducting our business, or servicing you.
          </p>
          <p className="mt-3">
            We may also release your information when we believe release is
            appropriate to comply with the law, enforce our site policies, or
            protect ours or others rights, property, or safety.
          </p>
        </section>
        <section>
          <h2 className="font-serif text-2xl text-stone-100">Third party links</h2>
          <p className="mt-3">
            Occasionally, at our discretion, we may include or offer third
            party products or services on our website.
          </p>
        </section>
        <section>
          <h2 className="font-serif text-2xl text-stone-100">
            California Online Privacy Protection Act Compliance
          </h2>
          <p className="mt-3">
            We have taken necessary precautions to be in compliance with the
            California Online Privacy Protection Act and will not distribute
            your personal information to outside parties without your consent.
          </p>
        </section>
        <section>
          <h2 className="font-serif text-2xl text-stone-100">
            Childrens Online Privacy Protection Act Compliance
          </h2>
          <p className="mt-3">
            We are in compliance with COPPA. We do not collect any information
            from anyone under 13 years of age.
          </p>
        </section>
        <section>
          <h2 className="font-serif text-2xl text-stone-100">
            Online Privacy Policy Only
          </h2>
          <p className="mt-3">
            This online privacy policy applies only to information collected
            through our website and not to information collected offline.
          </p>
        </section>
        <section>
          <h2 className="font-serif text-2xl text-stone-100">
            Terms and Conditions
          </h2>
          <p className="mt-3">
            Please also visit our Terms and Conditions page establishing the
            use, disclaimers, and limitations of liability governing the use of
            our website at Terms of Use.
          </p>
        </section>
        <section>
          <h2 className="font-serif text-2xl text-stone-100">Your Consent</h2>
          <p className="mt-3">
            By using our site, you consent to our website privacy policy.
          </p>
        </section>
        <section>
          <h2 className="font-serif text-2xl text-stone-100">
            Changes to our Privacy Policy
          </h2>
          <p className="mt-3">
            If we decide to change our privacy policy, we will post those
            changes on this page. This policy was last modified on Jun 22nd,
            2024.
          </p>
        </section>
        <section>
          <h2 className="font-serif text-2xl text-stone-100">Contacting Us</h2>
          <p className="mt-3">
            If there are any questions regarding this privacy policy you may
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
