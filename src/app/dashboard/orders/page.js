"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  RiArrowRightSLine,
  RiFileList2Line,
  RiMailSendLine,
} from "react-icons/ri";
import { useAuth } from "@/context/AuthContext";
import { getFirebaseAuth } from "@firebase/client";
import { fetchOrdersForCurrentUser } from "@/lib/orders-queries";
import { formatUsd } from "@/lib/money";

function formatWhen(iso) {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return String(iso);
    return d.toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return String(iso);
  }
}

/** @param {unknown[]} lines */
function totalLineQuantity(lines) {
  if (!Array.isArray(lines)) return 0;
  return lines.reduce((sum, l) => sum + Number(l?.quantity ?? 0), 0);
}

/** @param {unknown[]} lines */
function linesPreview(lines) {
  if (!Array.isArray(lines) || lines.length === 0) {
    return { primary: "No line items", extra: 0 };
  }
  const titles = lines
    .map((l) => (l && typeof l.title === "string" ? l.title.trim() : ""))
    .filter(Boolean);
  if (titles.length === 0) {
    return { primary: `${lines.length} item(s)`, extra: 0 };
  }
  const [first, ...rest] = titles;
  return { primary: first, extra: rest.length };
}

/** @param {Record<string, unknown> | null | undefined} addr */
function shipToSummary(addr) {
  if (!addr || typeof addr !== "object") return null;
  const fullName =
    typeof addr.fullName === "string" ? addr.fullName.trim() : "";
  const city = typeof addr.city === "string" ? addr.city.trim() : "";
  const state = typeof addr.state === "string" ? addr.state.trim() : "";
  const country = typeof addr.country === "string" ? addr.country.trim() : "";
  const locality = [city, state].filter(Boolean).join(", ");
  const tail = [locality, country].filter(Boolean).join(" · ");
  if (fullName && tail) return `${fullName} · ${tail}`;
  if (fullName) return fullName;
  if (tail) return tail;
  return null;
}

/** @param {Record<string, unknown> | null | undefined} f */
function fulfillmentLabel(f) {
  if (!f || typeof f !== "object") return null;
  const provider = f.provider != null ? String(f.provider) : "";
  const status = f.providerStatus != null ? String(f.providerStatus) : "";
  if (provider && status) return `${provider} · ${status}`;
  if (status) return status;
  if (provider) return provider;
  return null;
}

/** @param {unknown} payment */
function paymentHint(payment) {
  if (!payment || typeof payment !== "object") return null;
  if (payment.provider === "paypal") return "PayPal";
  if (typeof payment.provider === "string" && payment.provider)
    return payment.provider;
  if ("paypalCaptureId" in payment || "paypalOrderId" in payment) return "PayPal";
  return null;
}

const PAGE_SIZE = 10;

export default function DashboardOrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [resendState, setResendState] = useState({
    orderId: null,
    loading: false,
    message: null,
    error: null,
  });
  const [expandedById, setExpandedById] = useState({});

  function toggleOrderExpanded(orderId) {
    setExpandedById((prev) => ({ ...prev, [orderId]: !prev[orderId] }));
  }

  async function handleResendOrderEmail(orderId, e) {
    e.preventDefault();
    e.stopPropagation();
    setResendState({
      orderId,
      loading: true,
      message: null,
      error: null,
    });
    try {
      const auth = getFirebaseAuth();
      const u = auth.currentUser;
      if (!u) throw new Error("Sign in again to send email.");
      const token = await u.getIdToken();
      const res = await fetch("/api/orders/resend-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ orderId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          typeof data?.error === "string" ? data.error : "Could not send email.",
        );
      }
      setResendState({
        orderId,
        loading: false,
        message:
          "Order details emailed to the buyer. The shop inbox was CC'd when it is not the same as the buyer.",
        error: null,
      });
      window.setTimeout(() => {
        setResendState((s) =>
          s.message ? { ...s, message: null } : s,
        );
      }, 6000);
    } catch (err) {
      setResendState({
        orderId: null,
        loading: false,
        message: null,
        error: err instanceof Error ? err.message : "Could not send email.",
      });
    }
  }

  useEffect(() => {
    if (authLoading || !user) return;

    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const list = await fetchOrdersForCurrentUser();
        if (!cancelled) setOrders(list);
      } catch (e) {
        const code = e?.code;
        const msg =
          code === "permission-denied"
            ? "Could not load orders. Deploy updated Firestore rules if you just added dashboard reads."
            : e instanceof Error
              ? e.message
              : "Could not load orders.";
        if (!cancelled) setError(msg);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user, authLoading]);

  useEffect(() => {
    setPage(1);
  }, [user?.uid]);

  const totalPages = Math.max(1, Math.ceil(orders.length / PAGE_SIZE));

  useEffect(() => {
    setPage((p) => Math.min(Math.max(1, p), totalPages));
  }, [totalPages]);

  const pagedOrders = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return orders.slice(start, start + PAGE_SIZE);
  }, [orders, page]);

  const rangeStart = orders.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PAGE_SIZE, orders.length);

  if (authLoading) {
    return (
      <div className="mx-auto max-w-4xl">
        <p className="text-sm text-stone-400">Loading…</p>
      </div>
    );
  }

  if (!user?.email) {
    return (
      <div className="mx-auto max-w-4xl">
        <p className="text-stone-400">Sign in to see orders linked to your email.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8">
        <h1 className="font-serif text-4xl font-medium tracking-[-0.03em] text-stone-100 sm:text-5xl">
          Orders
        </h1>
        <p className="mt-3 max-w-2xl text-lg leading-relaxed text-stone-300/95">
          Orders placed with{" "}
          <span className="text-stone-200">{user.email}</span> at checkout.
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-stone-400">Loading orders…</p>
      ) : error ? (
        <p className="text-sm text-red-400/90" role="alert">
          {error}
        </p>
      ) : orders.length === 0 ? (
        <div className="rounded-3xl border-2 border-slate-700/40 bg-slate-900/45 p-10 text-center shadow-lg shadow-slate-950/30 backdrop-blur">
          <p className="text-stone-400">No orders yet.</p>
          <Link
            href="/shop"
            className="mt-4 inline-block text-sm font-semibold text-amber-200/95 underline decoration-amber-400/40 underline-offset-4 transition hover:text-amber-100"
          >
            Browse the shop →
          </Link>
        </div>
      ) : (
        <>
        {resendState.message ? (
          <p
            className="mb-4 rounded-xl border border-emerald-500/35 bg-emerald-950/30 px-4 py-3 text-sm text-emerald-100/95"
            role="status"
          >
            {resendState.message}
          </p>
        ) : null}
        {resendState.error ? (
          <p
            className="mb-4 rounded-xl border border-rose-500/35 bg-rose-950/30 px-4 py-3 text-sm text-rose-100/95"
            role="alert"
          >
            {resendState.error}
          </p>
        ) : null}

        <ul className="flex flex-col gap-4">
          {pagedOrders.map((o) => {
            const lines = Array.isArray(o.lines) ? o.lines : [];
            const lineCount = lines.length;
            const qty = totalLineQuantity(lines);
            const preview = linesPreview(lines);
            const shipTo = shipToSummary(o.shippingAddress);
            const fulfill = fulfillmentLabel(o.fulfillment);
            const pay = paymentHint(o.payment);
            const sub = Number(o.subtotalUsd ?? 0);
            const ship = Number(o.shippingUsd ?? 0);

            const resendBusy =
              resendState.loading && resendState.orderId === o.id;
            const isOpen = Boolean(expandedById[o.id]);

            return (
              <li key={o.id}>
                <div className="flex rounded-2xl border border-slate-700/35 bg-slate-900/40 shadow-md shadow-slate-950/25 backdrop-blur-sm transition hover:border-amber-400/35 hover:bg-slate-900/60">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start gap-2 p-4 sm:p-5">
                      <button
                        type="button"
                        onClick={() => toggleOrderExpanded(o.id)}
                        aria-expanded={isOpen}
                        aria-controls={`order-panel-${o.id}`}
                        id={`order-expand-${o.id}`}
                        title={isOpen ? "Collapse order" : "Expand order"}
                        className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-600/40 bg-slate-950/50 text-slate-400 transition hover:border-amber-400/30 hover:bg-slate-800/80 hover:text-amber-200/90"
                      >
                        <RiArrowRightSLine
                          className={`h-5 w-5 transition-transform duration-200 ${isOpen ? "rotate-90" : ""}`}
                          aria-hidden
                        />
                      </button>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="min-w-0">
                            <Link
                              href={`/dashboard/orders/${encodeURIComponent(o.id)}`}
                              className="font-mono text-sm text-amber-200/95 underline decoration-amber-500/25 underline-offset-2 transition hover:text-amber-100 hover:decoration-amber-400/50"
                            >
                              {o.id}
                            </Link>                            
                          </div>
                          <div className="shrink-0 text-right">
                            <p className="text-lg font-semibold tabular-nums text-stone-100">
                              {formatUsd(o.totalUsd ?? 0)}
                            </p>
                          </div>
                        </div>

                        {!isOpen ? (
                          <p className="mt-3 line-clamp-2 text-sm text-stone-400">
                            <span className="text-slate-600">Summary · </span>
                            {preview.primary}
                            {preview.extra > 0 ? (
                              <span className="text-slate-600">
                                {" "}
                                (+{preview.extra} more)
                              </span>
                            ) : null}
                            {shipTo ? (
                              <>
                                <span className="text-slate-600"> · </span>
                                <span className="text-stone-500">{shipTo}</span>
                              </>
                            ) : null}
                          </p>
                        ) : null}
                      </div>
                    </div>

                    {isOpen ? (
                      <div
                        id={`order-panel-${o.id}`}
                        role="region"
                        aria-labelledby={`order-expand-${o.id}`}
                        className="border-t border-slate-700/35 px-4 pb-5 pt-0 sm:px-5"
                      >
                        <div className="space-y-4 pt-4">
                          {shipTo ? (
                            <p className="text-sm text-stone-300/95">
                              <span className="text-slate-500">Ship to </span>
                              {shipTo}
                            </p>
                          ) : null}

                          <p className="mt-0.5 text-xs text-slate-500">
                            Placed {formatWhen(o.createdAt)}
                          </p>

                          <div>
                            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                              Items ({lineCount} line{lineCount === 1 ? "" : "s"}{" "}
                              · {qty} unit{qty === 1 ? "" : "s"})
                            </p>
                            <p className="mt-1 text-sm leading-snug text-stone-200">
                              {preview.primary}
                              {preview.extra > 0 ? (
                                <span className="text-slate-500">
                                  {" "}
                                  · +{preview.extra} more
                                </span>
                              ) : null}
                            </p>
                          </div>

                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                            {fulfill ? (
                              <span>
                                <span className="text-slate-600">
                                  Fulfillment:{" "}
                                </span>
                                <span className="text-slate-400">{fulfill}</span>
                              </span>
                            ) : null}
                            {pay ? (
                              <span>
                                <span className="text-slate-600">Payment: </span>
                                <span className="text-slate-400">{pay}</span>
                              </span>
                            ) : null}
                            {o.phone ? (
                              <span>
                                <span className="text-slate-600">Phone: </span>
                                <span className="text-slate-400">{o.phone}</span>
                              </span>
                            ) : null}
                          </div>

                          <div className="flex flex-wrap items-end justify-between gap-4 border-t border-slate-700/30 pt-4">
                            <div className="text-xs tabular-nums text-slate-500">
                              <p>Subtotal {formatUsd(sub)}</p>
                              <p>Shipping {formatUsd(ship)}</p>
                            </div>
                            <Link
                              href={`/dashboard/orders/${encodeURIComponent(o.id)}`}
                              className="text-sm font-medium text-amber-200/90 transition hover:text-amber-100"
                            >
                              View full order →
                            </Link>
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </div>
                  <div className="flex shrink-0 flex-col gap-1 border-l border-slate-700/35 p-2 sm:p-3">
                    <button
                      type="button"
                      onClick={(e) => handleResendOrderEmail(o.id, e)}
                      disabled={resendBusy}
                      title="Email HTML order details to the buyer (CC shop inbox)"
                      aria-label={`Email order ${o.id} details to buyer`}
                      className="flex h-10 w-10 items-center justify-center rounded-xl text-amber-200/90 transition hover:bg-slate-800/90 hover:text-amber-100 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <RiMailSendLine
                        className={`h-5 w-5 ${resendBusy ? "animate-pulse" : ""}`}
                        aria-hidden
                      />
                    </button>
                    <Link
                      href={`/dashboard/orders/${encodeURIComponent(o.id)}`}
                      title="View order details"
                      aria-label={`View order ${o.id}`}
                      className="flex h-10 w-10 items-center justify-center rounded-xl text-amber-200/90 transition hover:bg-slate-800/90 hover:text-amber-100"
                    >
                      <RiFileList2Line className="h-5 w-5" aria-hidden />
                    </Link>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        <nav
          className="mt-8 flex flex-col items-stretch gap-4 border-t border-slate-700/40 pt-6 sm:flex-row sm:items-center sm:justify-between"
          aria-label="Orders pagination"
        >
          <p className="text-center text-sm text-slate-500 sm:text-left">
            Showing{" "}
            <span className="tabular-nums text-stone-400">
              {rangeStart}–{rangeEnd}
            </span>{" "}
            of{" "}
            <span className="tabular-nums text-stone-400">{orders.length}</span>
          </p>
          <div className="flex items-center justify-center gap-2 sm:justify-end">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-lg border border-slate-600/50 bg-slate-900/60 px-4 py-2 text-sm font-medium text-stone-200 transition hover:border-amber-400/35 hover:bg-slate-800/80 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>
            <span className="min-w-28 text-center text-sm text-stone-400">
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="rounded-lg border border-slate-600/50 bg-slate-900/60 px-4 py-2 text-sm font-medium text-stone-200 transition hover:border-amber-400/35 hover:bg-slate-800/80 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </nav>
        </>
      )}
    </div>
  );
}
