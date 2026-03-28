"use client";

export default function DashboardOrdersPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="font-serif text-2xl font-semibold text-stone-100">Orders</h1>
      <p className="mt-2 text-slate-500">
        Order management UI can list Firestore <code className="text-slate-400">orders</code>{" "}
        here. Protected routes require sign-in.
      </p>
    </div>
  );
}
