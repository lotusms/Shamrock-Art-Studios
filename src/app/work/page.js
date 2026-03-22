import PageLayout from "@/components/PageLayout";

export const metadata = {
  title: "Work | Shamrock Art Studio",
  description: "Selected works and collection preview from Shamrock Art Studio.",
};

export default function WorkPage() {
  return (
    <PageLayout title="Work" eyebrow="Collection">
      <p>
        This page is ready for your exhibition grid, series, or catalog. Wire it
        to your CMS or replace this copy when you ship real pieces.
      </p>
      <p className="text-stone-400">
        Tip: the homepage still includes a rich grid preview — you can migrate
        that layout here or keep both in sync.
      </p>
    </PageLayout>
  );
}
