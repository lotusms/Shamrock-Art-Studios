import PageLayout from "@/components/PageLayout";

export const metadata = {
  title: "About | Shamrock Art Studio",
  description: "Studio story, practice, and how Shamrock Art Studio works online.",
};

export default function AboutPage() {
  return (
    <PageLayout title="About" eyebrow="Studio">
      <p>
        Shamrock Art Studio is built as a digital-first gallery: sharp typography,
        immersive presentation, and clear paths for collectors and commissions.
      </p>
      <p>
        Replace this section with your biography, statement, press, and team —
        the route and navigation are already wired.
      </p>
    </PageLayout>
  );
}
